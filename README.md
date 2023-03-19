# AI Job Descriptions

This is just a play thing for me, where I am using the OpenAI API to learn more about different job titles that I see.

The goal is to eventually tie this into <https://texaswfc.com> , where people will be able to see what a specific job entails, how much it pays and then decide if they want to take the course or not.

It is inspired heaving by the  OpenAI API [quickstart tutorial](https://beta.openai.com/docs/quickstart). It uses the [Next.js](https://nextjs.org/) framework with [React](https://reactjs.org/). Check out the tutorial or follow the instructions below to get set up.

I've also modified it to use TailwindCSS.. because I want to learn it.
## Setup

1. If you don’t have Node.js installed, [install it from here](https://nodejs.org/en/) (Node.js version >= 14.6.0 required)

2. Clone this repository

3. Navigate into the project directory

   ```bash
   cd job.descriptions
   ```

4. Install the requirements

   ```bash
   npm install
   ```

5. Make a copy of the example environment variables file

   On Linux systems:

   ```bash
   cp env.example .env
   ```

   On Windows:

   ```powershell
   copy env.example .env
   ```

6. Add your [API key](https://beta.openai.com/account/api-keys) to the newly created `.env` file

7. Run the app

   ```bash
   npm run dev
   ```

You should now be able to access the app at [http://localhost:3000](http://localhost:3000)!

Enter a job title, and it'll give you some information about it.
