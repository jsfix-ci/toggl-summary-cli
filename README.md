This uses the [dotenv] module for loading secrets from a .env file in the root of the project. This is included in `.gitignore` as it should not be committed. The file is required to contain:

```
API_TOKEN=<api token, found in Toggle profile settings>
EMAIL=<your email address>
WORKSPACE_ID=<id of the Toggle workspace>

```