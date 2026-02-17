import json

package_data = {
    "name": "smart-router",
    "displayName": "Smart Router",
    "description": "Automatic AI model routing based on intent classification for VS Code",
    "version": "0.2.0",
    "engines": {
        "vscode": "^1.74.0"
    },
    "categories": [
        "Other",
        "Machine Learning",
        "Snippets"
    ],
    "activationEvents": [
        "onChatParticipant:smart"
    ],
    "main": "./out/extension.js",
    "contributes": {
        "chatParticipants": [
            {
                "id": "smart",
                "name": "Smart Router",
                "description": "AI model routing based on intent classification",
                "isSticky": True
            }
        ],
        "commands": [
            {
                "command": "smart.showCosts",
                "title": "Show Model Costs",
                "category": "Smart Router"
            },
            {
                "command": "smart.showStatus",
                "title": "Show Status",
                "category": "Smart Router"
            },
            {
                "command": "smart.clearPreferences",
                "title": "Clear Preferences",
                "category": "Smart Router"
            },
            {
                "command": "smart.openSettings",
                "title": "Open Settings",
                "category": "Smart Router"
            },
            {
                "command": "smart.explainRouting",
                "title": "Explain Routing Logic",
                "category": "Smart Router"
            },
            {
                "command": "smart.startArena",
                "title": "Start Arena Mode",
                "category": "Smart Router"
            },
            {
                "command": "smart.showChineseModels",
                "title": "Show Chinese Models",
                "category": "Smart Router"
            },
            {
                "command": "smart.showContextCache",
                "title": "Show Context Cache",
                "category": "Smart Router"
            },
            {
                "command": "smart.clearContextCache",
                "title": "Clear Context Cache",
                "category": "Smart Router"
            }
        ],
        "configuration": {
            "title": "Smart Router",
            "properties": {
                "smartRouter.enabled": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable Smart Router extension"
                },
                "smartRouter.openrouterApiKey": {
                    "type": "string",
                    "default": "",
                    "description": "OpenRouter API key",
                    "scope": "application"
                },
                "smartRouter.defaultModel": {
                    "type": "string",
                    "default": "auto",
                    "description": "Default model to use",
                    "enum": ["auto", "free", "budget", "premium"]
                },
                "smartRouter.costWarningThreshold": {
                    "type": "number",
                    "default": 5.0,
                    "description": "Daily cost warning threshold"
                },
                "smartRouter.monthlyBudget": {
                    "type": "number",
                    "default": 50.0,
                    "description": "Monthly budget limit"
                },
                "smartRouter.budgetAlerts": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable budget alerts"
                },
                "smartRouter.localClassifier": {
                    "type": "string",
                    "default": "ollama:qwen3:8b",
                    "description": "Local classifier model"
                },
                "smartRouter.arenaMode": {
                    "type": "boolean",
                    "default": False,
                    "description": "Enable Arena Mode (v2.0 feature)"
                },
                "smartRouter.battleGroup": {
                    "type": "string",
                    "default": "hybrid",
                    "description": "Default battle group for Arena Mode",
                    "enum": ["frontier", "fast", "hybrid"]
                },
                "smartRouter.chineseModels": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable Chinese AI models (v2.0 feature)"
                },
                "smartRouter.contextCache": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable context caching (v2.0 feature)"
                },
                "smartRouter.predictiveCost": {
                    "type": "boolean",
                    "default": False,
                    "description": "Enable predictive cost engine (v2.0 feature)"
                }
            }
        }
    },
    "scripts": {
        "vscode:prepublish": "npm run compile",
        "compile": "tsc -p ./",
        "watch": "tsc -watch -p ./"
    },
    "devDependencies": {
        "@types/vscode": "^1.74.0",
        "@types/node": "16.x",
        "typescript": "^4.9.4"
    },
    "dependencies": {
        "axios": "^1.6.0"
    }
}

with open('package.json', 'w') as f:
    json.dump(package_data, f, indent=2)

print("package.json created successfully!")
