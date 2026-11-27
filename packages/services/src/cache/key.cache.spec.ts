import {RedisKey} from "./key.cache";
import {describe, expect, it} from "vitest";

/**
 * Cache keys have to be the same for the same question and different for different
 * questions: a collision means one request gets another request's cached answer.
 */

describe("RedisKey", () => {
  describe("getUserProfileKey", () => {
    it("builds the profile key of one user", () => {
      expect(RedisKey.getUserProfileKey("42")).toBe("user:profile:user-id=42");
    });

    it("gives every user a key of their own", () => {
      expect(RedisKey.getUserProfileKey("1")).not.toBe(RedisKey.getUserProfileKey("2"));
    });
  });

  describe("build", () => {
    it("joins the parts under the resource", () => {
      expect(RedisKey.build("user", "session", "userId=1")).toBe("user:session:userId=1");
    });

    it("leaves out empty, null and undefined parts, so there are no double colons", () => {
      expect(RedisKey.build("user", "a", "", null, undefined, "b")).toBe("user:a:b");
    });

    it("trims each part", () => {
      expect(RedisKey.build("user", "  padded  ")).toBe("user:padded");
    });
  });
  describe("getUserProfileKey", () => {
    it("builds the profile key of one user", () => {
      expect(RedisKey.getUserProfileKey("42")).toBe("user:profile:user-id=42");
    });

    it("gives every user a key of their own", () => {
      expect(RedisKey.getUserProfileKey("1")).not.toBe(RedisKey.getUserProfileKey("2"));
    });
  });

  describe("build", () => {
    it("joins the parts under the resource", () => {
      expect(RedisKey.build("user", "session", "userId=1")).toBe("user:session:userId=1");
    });

    it("leaves out empty, null and undefined parts, so there are no double colons", () => {
      expect(RedisKey.build("user", "a", "", null, undefined, "b")).toBe("user:a:b");
    });

    it("trims each part", () => {
      expect(RedisKey.build("user", "  padded  ")).toBe("user:padded");
    });
  });

});
