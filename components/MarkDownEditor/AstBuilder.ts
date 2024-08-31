import { headers } from "next/headers";
import { channel } from "node:diagnostics_channel";
import { posix } from "node:path";
import * as nodeUtil from "node:util";

type MarkdownAST = {
	nodes?: AstNode[];
};

type AstNode = {
	token?: MarkdownToken;
	children?: AstNode[];
	parent?: AstNode;
};

type MarkdownToken = {
	tokenName: string;
	tokenValue: string;
};

function isDigit(char: string): boolean {
	return /^\d$/.test(char);
}

function lex(input: string): MarkdownToken[] | undefined {
	let currentText = "";
	let currentToken: MarkdownToken = {
		tokenValue: "",
		tokenName: "",
	};
	let currentNumber = "";
	const emptyToken: MarkdownToken = {
		tokenValue: "",
		tokenName: "",
	};

	let tokenList: MarkdownToken[] = [];
	let postion = 0;
	while (postion <= input.length - 1) {
		const char = input[postion];
		switch (char) {
			case "_":
				if (!(currentText === "")) {
					currentToken = {
						tokenName: "MD_TEXT",
						tokenValue: currentText,
					};
					tokenList = tokenList.concat(currentToken);
					currentText = "";
				}
				currentToken = {
					tokenName: "MD_ITALIC",
					tokenValue: "_",
				};
				break;
			case "-":
				if (!(currentText === "")) {
					currentToken = {
						tokenName: "MD_TEXT",
						tokenValue: currentText,
					};
					tokenList = tokenList.concat(currentToken);
					currentText = "";
				}
				currentToken = {
					tokenName: "MD_LIST",
					tokenValue: "-",
				};
				break;
			case "*":
				if (!(currentText === "")) {
					currentToken = {
						tokenName: "MD_TEXT",
						tokenValue: currentText,
					};
					tokenList = tokenList.concat(currentToken);
					currentText = "";
				}
				if (input.length > postion && input[postion + 1] === "*") {
					currentToken = {
						tokenName: "MD_BOLD",
						tokenValue: "**",
					};
					postion += 1;
				}
				break;
			case "~":
				if (!(currentText === "")) {
					currentToken = {
						tokenName: "MD_TEXT",
						tokenValue: currentText,
					};
					tokenList = tokenList.concat(currentToken);
					currentText = "";
				}
				currentToken = {
					tokenName: "MD_OVERLOAD",
					tokenValue: "~",
				};
				break;
			case "```":
				if (!(currentText === "")) {
					currentToken = {
						tokenName: "MD_TEXT",
						tokenValue: currentText,
					};
					tokenList = tokenList.concat(currentToken);
					currentText = "";
				}
				currentToken = {
					tokenName: "MD_CODE",
					tokenValue: "```",
				};
				postion += 2;
				break;
			case "\n":
				if (!(currentText === "")) {
					currentToken = {
						tokenName: "MD_TEXT",
						tokenValue: currentText,
					};
					tokenList = tokenList.concat(currentToken);
					currentText = "";
				}
				currentToken = {
					tokenName: "MD_NEW_LINE",
					tokenValue: "\n",
				};
				break;
			default:
				// num list tokens
				currentToken = emptyToken;
				if (isDigit(char)) {
					currentNumber = currentNumber.concat(char);
				} else {
					if (char === ".") {
						if (currentNumber !== "") {
							tokenList = tokenList.concat({
								tokenName: "MD_NUM_LIST",
								tokenValue: `${currentNumber}.`,
							});
							currentNumber = "";
							currentText = "";
						} else {
							currentText = currentText.concat(char);
						}
					} else {
						currentText = currentText.concat(char);
					}
				}
		}

		if (!(currentToken === emptyToken)) {
			tokenList = tokenList.concat(currentToken);
		}
		postion++;
	}
	if (currentText.trim() !== "") {
		tokenList = tokenList.concat({
			tokenName: "MD_TEXT",
			tokenValue: currentText,
		});
		currentText = "";
	}
	return tokenList;
}

function parseInput(input: MarkdownToken[]): MarkdownAST | undefined {
	const rootNode: AstNode = {
		token: {
			tokenName: "MD_ROOT",
			tokenValue: "",
		},
		children: [],
		parent: undefined,
	};
	const ast: MarkdownAST = {};
	const tokensWithChildren: string[] = [
		"MD_ITALIC",
		"MD_BOLD",
		"MD_LIST",
		"MD_NUM_LIST",
		"MD_CODE",
		"MD_OVERLOAD",
	];

	const tagTokens: string[] = [
		"MD_ITALIC",
		"MD_BOLD",
		"MD_CODE",
		"MD_OVERLOAD",
	];

	const tokensWithoutChildren: string[] = ["MD_TEXT", "MD_NEW_LINE"];

	let postion = 0;
	let currentParent: AstNode = {};
	let currentNode: AstNode = {};
	type Semantics = {
		elements: [
			{
				positionInInput: number;
				reference: AstNode;
			},
		];
	};

	let semantics: Semantics = { elements: []};

	while (postion <= input.length - 1) {
		currentNode = {
			token: input[postion],
			parent: currentParent.token === undefined ? rootNode : currentParent,
		};
		const currentToken = currentNode.token ?? {
			tokenName: "",
			tokenValue: "",
		};
		if (currentToken?.tokenName in tagTokens) {
			switch (currentToken?.tokenName) {
				case "MD_ITALIC":
          semantics.elements = semantics.elements.concat({
          
        })
				default:
			}
		}
		postion++;
	}
	ast.nodes = ast.nodes?.concat(rootNode);
	return ast;
}

// test
console.log(
	lex(
		"_This is markdown_ and text and a \n new line \n 2. \n 2. ... and you know what?",
	),
);
console.log(parseInput("Hello world"));

function buildASTTable(input: string): [MarkdownAST] | null {
	return null;
}
