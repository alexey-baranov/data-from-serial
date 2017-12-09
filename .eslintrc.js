module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2017
    },
    "rules": {
        "linebreak-style": [
            2,
            "windows"
        ],
        "indent": [1, 2, {"VariableDeclarator":{"const":3, "var":2, "let":2}, "SwitchCase": 1}],
        "quotes": [
            2,
            "single"
        ],
        "semi": [
            2,
            "always"
        ]
    }
};