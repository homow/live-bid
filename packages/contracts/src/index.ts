export interface BidEvent {
  actionId: string;
  userId: string;
  active: boolean;
}

export const WS_EVENTS = {
  NEW_BID: 'new_bid',
  AUCTION_ENDED: 'auction_ended',
} as const;
