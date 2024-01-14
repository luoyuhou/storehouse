export enum EStoreStatusConst {
  FROZEN = -3,
  CANCEL = -2,
  REJECTED = -1,
  PENDING = 0,
  PREVIEW = 1,
  REVIEWED = 2,
  APPROVED = 3,
  SUSPENDED = 4, // hung up
  OPENED = 5, // hung up
  CLOSED = 6,
}
export enum EStoreActionTypes {
  close = 0,
  apply = 1,
  review = 2,
  approved = 3,
  transform = 4,
}
