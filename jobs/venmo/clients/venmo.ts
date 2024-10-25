import { BaseService } from "./BaseService";
import logger from "@/server/logger";
import type { PostsResponse, Story } from "./types";
import { prisma } from "@/server/db";

export class VenmoClient extends BaseService {
  csrfToken: string | undefined = undefined;
  private sharedHeaders = () => {
    return {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en",
      "cache-control": "max-age=0",
      priority: "u=0, i",
      referer: "https://account.venmo.com/",
      "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      authority: "venmo.com",
      "content-type": "application/json",
      cookie: `v_id=fp01-b00e009a-ba8b-4431-b005-ab6e03a116c7; s_id=4729a0a3-2d7b-4cc4-aca2-78d477880bbe; _csrf=cdfsEFIsm-mCqSiTYHiTfkhe; login_email=${process.env.VENMO_USERNAME}; cookie_prefs=T%3D1%2CP%3D1%2CF%3D1%2Ctype%3Dexplicit_banner`,
      "csrf-token": this.csrfToken || "SkpNaPOP-9jZMUkhKNd8GkkQDIc6mNfzl7xU",
      "xsrf-token": this.csrfToken || "SkpNaPOP-9jZMUkhKNd8GkkQDIc6mNfzl7xU",
      origin: "https://venmo.com",
    };
  };

  login = async () => {
    try {
      await this.tryLogin();
      logger.info(`Logged in successfully`);
      return;
    } catch (e) {
      logger.error(e);
      throw new Error(`Failed to login ${e}`);
    }
  };

  private tryLogin = async () => {
    if (!process.env.VENMO_PWD) {
      throw new Error("VENMO_PWD not set");
    }
    const response = await this.post(
      "https://venmo.com/api/login",
      {
        username: process.env.VENMO_USERNAME,
        password: process.env.VENMO_PWD,
        isGroup: false,
      },
      {
        headers: this.sharedHeaders(),
      },
    );
    return response.data;
  };

  private likePost = async (postId: string) => {
    try {
      const response = await this.post(`https://account.venmo.com/api/stories/likes/${postId}`, "", {
        headers: this.sharedHeaders(),
      });
      logger.info(`Liked post ${postId} - status ${response.status}`);
    } catch (e) {
      logger.error(`Failed to like post ${postId}`);
    }
  };

  private loadCsrf = async () => {
    if (this.csrfToken) {
      return;
    }
    const response = await this.get<string>("https://account.venmo.com/", {
      params: {
        feed: "mine",
      },
      headers: this.sharedHeaders(),
    });

    const text = response.data;
    const match = text.match(/"csrfToken":"(.*?)?"/);
    if (!match) {
      // throw new Error("Failed to find csrf token");
    }
    this.csrfToken = match?.[1];
  };
  private fetchPosts = async (nextId?: string) => {
    const response = await this.get<PostsResponse>("https://account.venmo.com/api/stories", {
      params: {
        feedType: "me",
        externalId: "1518966010806273018",
        ...(nextId ? { nextId } : {}),
      },
    });
    return response.data;
  };

  private parseText = (entry: Story, message: string): string[] => {
    const valid = new Set<string>();
    try {
      if (!message) {
        return [];
      }

      // parse normal numbers
      const nums = message.split("\n").filter((i) => /^\d+$/.test(i));
      for (const num of nums) {
        const payment_id = num;
        if (payment_id.length === 8) {
          valid.add(payment_id);
        }
      }
      // if the message itself is just a single number, split out somehow
      const payment_id = nums.join("");
      if (payment_id.length === 8) {
        valid.add(payment_id);
      }
      // regex match fallback
      const regex_match = message.match(/\d+/g);
      if (regex_match) {
        for (const match of regex_match) {
          if (match.length === 8) {
            valid.add(match);
          }
        }
      }
      return Array.from(valid);
    } catch (e) {
      logger.error(e);
      return Array.from(valid);
    }
  };
  private submitPaidIds = async (ids: string[]) => {
    await prisma.watchedSection.updateMany({
      where: {
        paidId: {
          in: ids,
        },
      },
      data: {
        isPaid: true,
      },
    });
  };

  getPosts = async (handler: (p: Story[]) => Promise<void>): Promise<void> => {
    let depth = 0;
    let nextId = undefined;

    while (depth < 100) {
      const posts = await this.fetchPosts(nextId);
      const stories = posts?.stories;
      if (stories) {
        await handler(stories);
        nextId = posts.nextId;
        depth++;
        if (!posts.nextId) {
          logger.info("No more posts");
          break;
        }
      } else {
        logger.info(`Error getting posts at depth ${depth}`);
        logger.info(posts);
        break;
      }
    }
  };

  checkPosts = async () => {
    await this.loadCsrf();

    await this.getPosts(async (posts: Story[]) => {
      const postsToLike: string[] = [];
      const idsToSubmit: string[] = [];
      for (const payment of posts) {
        const likes = payment.likes;
        const message = payment?.note?.content;
        const validIds = this.parseText(payment, message);
        if (validIds.length) {
          if (!likes?.userCommentedOrLiked) {
            idsToSubmit.push(...validIds);
            postsToLike.push(payment.id);
          } else if (process.env.FORCE_RESUBMIT) {
            idsToSubmit.push(...validIds);
          }
        }
      }
      if (idsToSubmit.length) {
        logger.info(`Submitting ids: ${idsToSubmit}`);
        await this.submitPaidIds(idsToSubmit);
      }
      for (const id of postsToLike) {
        await this.likePost(id);
      }
    });
  };
}
