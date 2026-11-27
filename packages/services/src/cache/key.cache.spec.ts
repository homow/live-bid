import {RedisKey} from "./key.cache";
import {describe, expect, it} from "vitest";

/**
 * Cache keys have to be the same for the same question and different for different
 * questions: a collision means one request gets another request's cached answer.
 */

describe("RedisKey", () => {

});
