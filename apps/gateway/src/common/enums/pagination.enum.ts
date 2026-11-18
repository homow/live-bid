import {registerEnumType} from "@nestjs/graphql";
import {BaseOrderByEnum, BaseSortByEnum} from "@live-bid/contracts/schemas";

// Sort By
registerEnumType(BaseSortByEnum, {
  name: 'BaseSortByEnum',
});

// Order By
registerEnumType(BaseOrderByEnum, {
  name: 'BaseOrderByEnum',
});

export {BaseOrderByEnum, BaseSortByEnum};
