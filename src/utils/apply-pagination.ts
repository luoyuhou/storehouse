import { UserEntity } from "src/types/users";

export type CustomerInfoType = UserEntity & {
  address: {
    city: string;
    country: string;
    state?: string;
    street: string;
    name?: string;
  };
  name: string;
  id: string;
  createdAt: number;
};

export function applyPagination(documents: CustomerInfoType[], page: number, rowsPerPage: number) {
  return documents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
