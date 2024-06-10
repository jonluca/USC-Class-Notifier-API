export interface PostsResponse {
  nextId: string;
  stories: Story[];
}

export interface Story {
  amount: Amount;
  avatar: string;
  initials: string;
  audience: Audience;
  date: Date;
  id: string;
  note: Note;
  type: Type;
  attachments: any[];
  title: Title;
  mentions: Mentions;
  externWalletStatus: null;
  paymentId: string;
  likes: Comments;
  comments: Comments;
  subType: StorySubType;
}

export enum Amount {
  The089 = "+ $0.89",
  The100 = "+ $1.00",
}

export enum Audience {
  Private = "private",
}

export interface Comments {
  count: number;
  userCommentedOrLiked: boolean;
}

export interface Mentions {
  count: number;
  data: any[];
}

export interface Note {
  content: string;
}

export enum StorySubType {
  None = "none",
  PaymentProtected = "payment_protected",
}

export interface Title {
  titleType: TitleType;
  payload: Payload;
  receiver: Receiver;
  sender: Receiver;
}

export interface Payload {
  action: Action;
  subType: PayloadSubType;
}

export enum Action {
  Pay = "pay",
}

export enum PayloadSubType {
  P2P = "p2p",
}

export interface Receiver {
  id: string;
  displayName: string;
  username: string;
}

export enum TitleType {
  Story = "story",
}

export enum Type {
  Payment = "payment",
}
