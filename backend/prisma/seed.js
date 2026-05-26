const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialQuestions = [
  // DBMS / SQL
  {
    category: "Database Management Systems",
    difficulty: "Medium",
    questionText: "Explain the difference between a Clustered and a Non-Clustered index in a database. How do they affect query search speed and write performance?"
  },
  {
    category: "Database Management Systems",
    difficulty: "Easy",
    questionText: "What are the ACID properties in database transactions? Explain each of the four properties with a simple, real-world example."
  },
  {
    category: "Database Management Systems",
    difficulty: "Medium",
    questionText: "What is Database Normalization? Explain the requirements for a database schema to be in 1NF, 2NF, and 3NF, and why normalization is important."
  },
  {
    category: "Database Management Systems",
    difficulty: "Easy",
    questionText: "Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN. Under what circumstances would you specifically choose a LEFT JOIN?"
  },
  
  // Core Programming (OOP)
  {
    category: "Core Programming",
    difficulty: "Easy",
    questionText: "What is the key difference between an Abstract Class and an Interface? Provide a practical scenario where you would choose one over the other."
  },
  {
    category: "Core Programming",
    difficulty: "Hard",
    questionText: "Explain the SOLID principles of Object-Oriented Design. Briefly summarize all five, and explain in detail the Liskov Substitution Principle (LSP) with an example."
  },
  {
    category: "Core Programming",
    difficulty: "Medium",
    questionText: "Explain Polymorphism in OOP. What is the fundamental difference between Compile-time Polymorphism (Method Overloading) and Runtime Polymorphism (Method Overriding)?"
  },

  // Data Structures and Algorithms (DSA)
  {
    category: "Data Structures and Algorithms",
    difficulty: "Medium",
    questionText: "How does a Hash Map work under the hood? Explain how key-value pairs are stored, what a hash collision is, and describe two common collision resolution techniques."
  },
  {
    category: "Data Structures and Algorithms",
    difficulty: "Easy",
    questionText: "Describe the Binary Search algorithm. What is its time and space complexity, and what is the essential prerequisite for executing binary search on an array?"
  },
  {
    category: "Data Structures and Algorithms",
    difficulty: "Medium",
    questionText: "What is a Singly Linked List? Write down the conceptual steps or algorithm to reverse a singly linked list in-place, without allocating extra memory for nodes."
  },

  // Behavioral
  {
    category: "Behavioral",
    difficulty: "Medium",
    questionText: "Describe a time when you had a disagreement with a team member on a technical approach or architectural decision. How did you communicate, resolve it, and what was the result?"
  },
  {
    category: "Behavioral",
    difficulty: "Medium",
    questionText: "Tell me about a time you faced a significant failure or made a mistake on a software engineering project. How did you analyze the mistake, handle it, and what did you learn?"
  }
];

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create a default user so the app is immediately usable
  const defaultUser = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john.doe@example.com"
    }
  });
  console.log(`👤 Seeded Default User: ${defaultUser.name} (${defaultUser.email})`);

  // 2. Seed initial questions
  let seededCount = 0;
  for (const q of initialQuestions) {
    const existing = await prisma.question.findFirst({
      where: { questionText: q.questionText }
    });

    if (!existing) {
      await prisma.question.create({
        data: q
      });
      seededCount++;
    }
  }

  console.log(`📊 Seeded ${seededCount} new questions into the database.`);
  console.log("🏁 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
