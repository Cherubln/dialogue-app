import prisma from "./client";
import bcrypt from "bcrypt";

const main = async () => {
  try {
    const users = await prisma.user.createMany({
      data: [
        {
          username: "Eric",
          password: await bcrypt.hash("testing123", 10),
          picture: "error",
        },
        {
          username: "Dashim",
          password: await bcrypt.hash("testing123", 10),
          picture: "info",
        },
        {
          username: "Hubert",
          password: await bcrypt.hash("testing123", 10),
          picture: "primary",
        },
        {
          username: "Shema",
          password: await bcrypt.hash("testing123", 10),
          picture: "warning",
        },
        {
          username: "Doe",
          password: await bcrypt.hash("testing123", 10),
          picture: "neutral",
        },
        {
          username: "Smith",
          password: await bcrypt.hash("testing123", 10),
          picture: "success",
        },
        {
          username: "Anna",
          password: await bcrypt.hash("testing123", 10),
          picture: "error",
        },
        {
          username: "Joel",
          password: await bcrypt.hash("testing123", 10),
          picture: "info",
        },
        {
          username: "Jane",
          password: await bcrypt.hash("testing123", 10),
          picture: "neutral",
        },
        {
          username: "Gates",
          password: await bcrypt.hash("testing123", 10),
          picture: "warning",
        },
      ],
    });
    console.log(users);
  } catch (error) {
    throw error;
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
