# MCCI Auto Board

### Prerequesites

1. Install Node.js https://nodejs.org/
2. Install npm https://github.com/npm/cli#installation
3. Install git https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

### Setup

Clone the repository
```sh
git clone https://github.com/Nick-NCSU/mcci-auto-board.git
```

Enter the directory
```sh
cd mcci-auto-board
```

Install packages
```sh
npm i
```

Setup environment variables
```sh
cp .env.example .env
```

Paste your speedrun.com API key (found in settings) in the `.env` file
```json
SRC_API_KEY="API_KEY_GOES_HERE"
```

Change line 15 of mcci.js to the id of the category.
Categories can be found here: https://www.speedrun.com/api/v1/games/k6qwn3z6/categories

### Running the application
The application can be ran by typing
```sh
npm start
```
