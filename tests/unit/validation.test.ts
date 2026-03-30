import {
    cleanAlphaInput,
    cleanAlphanumericInput,
    cleanInput,
    cleanNameInput,
    isStrongPassword,
    removeEmojis,
    validateEmail,
    validatePassword,
} from "@/utils/validation";

describe("validation utilities", () => {
	describe("cleanInput", () => {
		it("removes all whitespace and emojis", () => {
			const input = " he llo 🚀 world \n";
			const result = cleanInput(input);
			expect(result).toBe("helloworld");
		});

		it("keeps non-space, non-emoji characters", () => {
			const input = "abc123!@#";
			const result = cleanInput(input);
			expect(result).toBe("abc123!@#");
		});
	});

	describe("validateEmail", () => {
		it("returns false for empty or whitespace-only email", () => {
			expect(validateEmail("")) .toBe(false);
			expect(validateEmail("   ")).toBe(false);
		});

		it("returns false for invalid email formats", () => {
			expect(validateEmail("plainaddress")).toBe(false);
			expect(validateEmail("user@domain")) .toBe(false);
			expect(validateEmail("user@.com")) .toBe(false);
			expect(validateEmail("user@domain.")) .toBe(false);
			expect(validateEmail("user domain.com")) .toBe(false);
		});

		it("returns true for valid emails", () => {
			expect(validateEmail("test@example.com")).toBe(true);
			expect(validateEmail("user.name+tag@sub.domain.co")) .toBe(true);
		});
	});

	describe("validatePassword", () => {
		it("returns false for empty or whitespace-only password", () => {
			expect(validatePassword("")) .toBe(false);
			expect(validatePassword("   ")).toBe(false);
		});

		it("returns false for passwords shorter than 6 characters", () => {
			expect(validatePassword("12345")).toBe(false);
		});

		it("returns true for passwords with length >= 6", () => {
			expect(validatePassword("123456")).toBe(true);
			expect(validatePassword("  123456  ")).toBe(true);
		});
	});

	describe("isStrongPassword", () => {
		it("requires at least 8 characters, one uppercase, one digit, and one symbol", () => {
			expect(isStrongPassword("Aa1!aaaa")).toBe(true);
		});

		it("fails if missing uppercase, digit, or symbol, or too short", () => {
			expect(isStrongPassword("aa1!aaaa")).toBe(false); // no uppercase
			expect(isStrongPassword("AA!AAAAA")).toBe(false); // no digit
			expect(isStrongPassword("Aa1AAAAA")).toBe(false); // no symbol
			expect(isStrongPassword("Aa1!aaa")) .toBe(false); // too short
		});
	});

	describe("removeEmojis", () => {
		it("removes emoji characters and keeps text", () => {
			const input = "Hello 🌟 World 🚀";
			const result = removeEmojis(input);
			expect(result).toBe("Hello  World ");
		});
	});

	describe("cleanNameInput", () => {
		it("removes emojis and disallowed characters but keeps letters, numbers, dot, and space", () => {
			const input = "Jo🌟hn D'oe_12!";
			const result = cleanNameInput(input);
			expect(result).toBe("John Doe12");
		});
	});

	describe("cleanAlphaInput", () => {
		it("removes emojis and non-letter characters but keeps letters, dot, and space", () => {
			const input = "Mr. Jo🌟hn-Doe_12!";
			const result = cleanAlphaInput(input);
			expect(result).toBe("Mr. JohnDoe");
		});
	});

	describe("cleanAlphanumericInput", () => {
		it("removes emojis and non-alphanumeric characters but keeps letters, numbers, dot, and space", () => {
			const input = "Blk. 12-🌟A#@!";
			const result = cleanAlphanumericInput(input);
			expect(result).toBe("Blk. 12A");
		});
	});
});

