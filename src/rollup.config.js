import json from "@rollup/plugin-json";

export default args => {
    const result = [];
    // add json rollup plugin for importing emoji files
    result.push({
        input: "node_modules/emoji-mart/data/google.json",
        output: {
            File: "src/google.js",
            format: "cjs"
        },
        plugins: [json()]
    });
    return result;
};
