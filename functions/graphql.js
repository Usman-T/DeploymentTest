const { ApolloServer, gql } = require("apollo-server-lambda");
const resolvers = require("../src/resolvers");
const typeDefs = require("../src/typeDefs");
const User = require("../src/models/user");
const jwt = require("jsonwebtoken");


const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
});

exports.handler = server.createHandler({
  content: async ( req ) => {
    const auth = req?.headers?.authorization;

    if (auth?.startsWith("Bearer ")) {
      const token = auth.substring(7);
      try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(id);

        return { currentUser };
      } catch (error) {
        console.error("JWT Verification Error:", error.message);
        console.log("Invalid token");
        return {};
      }
    }

    return {};
  },
});
