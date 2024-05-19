import { BaseService } from "./BaseService";
import logger from "~/server/logger";
import type { PostsResponse, Story } from "./types";
import { prisma } from "~/server/db";

export class VenmoClient extends BaseService {
  csrfToken: string | undefined = undefined;
  private sharedHeaders = () => {
    return {
      authority: "venmo.com",
      accept: "*/*",
      "accept-language": "en",
      "content-type": "application/json",
      cookie: `v_id=fp01-6c6d6173-4b47-4ff2-adf3-5f1f204090f7; _csrf=cdfsEFIsm-mCqSiTYHiTfkhe; login_email=${process.env.VENMO_USERNAME}; cookie_prefs=T%3D1%2CP%3D1%2CF%3D1%2Ctype%3Dexplicit_banner`,
      "csrf-token": this.csrfToken || "SkpNaPOP-9jZMUkhKNd8GkkQDIc6mNfzl7xU",
      "xsrf-token": this.csrfToken || "SkpNaPOP-9jZMUkhKNd8GkkQDIc6mNfzl7xU",
      origin: "https://venmo.com",
      referer: "https://venmo.com/",
      "sec-ch-ua": '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    };
  };

  login = async () => {
    try {
      await this.tryLogin();
      logger.info(`Logged in successfully`);
      return;
    } catch (e) {
      logger.error(e);
    }
    throw new Error("Failed to login");
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
    const response = await this.get<string>("https://account.venmo.com/", {
      params: {
        feed: "mine",
      },
      headers: this.sharedHeaders(),
    });

    const text = response.data;
    const match = text.match(/"csrfToken":"(.*?)?"/);
    if (!match) {
      throw new Error("Failed to find csrf token");
    }
    const csrfToken = match[1];
    this.csrfToken = csrfToken;
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
    await prisma.section.updateMany({
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
    logger.info(`Fetching posts`);
    let depth = 0;
    let nextId = undefined;
    let count = 0;
    while (depth < 150) {
      const posts = await this.fetchPosts(nextId);
      const stories = posts?.stories;
      if (stories) {
        count += stories.length;
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
    logger.info(`Found ${count} posts`);
  };

  checkPosts = async () => {
    logger.info(`Loading csrf token`);
    await this.loadCsrf();
    logger.info(`Loaded csrf token`);
    const storyIdToPaidIdsMap = new Map<string, string[]>();
    await this.getPosts(async (posts: Story[]) => {
      for (const payment of posts) {
        const likes = payment.likes;
        const message = payment?.note?.content;
        if (!likes?.userCommentedOrLiked && message) {
          const validIds = this.parseText(payment, message);
          if (validIds.length) {
            storyIdToPaidIdsMap.set(payment.id, validIds);
          }
        }
      }
      const uniqueIds = Array.from(storyIdToPaidIdsMap.values()).flat();
      const ids = Array.from(storyIdToPaidIdsMap.keys());
      if (uniqueIds.length) {
        logger.info(`Submitting ids: ${uniqueIds}`);
        await this.submitPaidIds(uniqueIds);
        for (const id of ids) {
          await this.likePost(id);
        }
      } else {
        logger.info("No eligible submissions");
      }
    });
  };
}
