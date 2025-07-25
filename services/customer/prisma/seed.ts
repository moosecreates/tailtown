import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // This seed file has been modified to remove mock data
  // Per requirements: Mock data should only be used for tests, not for dev or prod environments
  
  console.log('Seed script executed - mock data creation removed')
  console.log('Please connect to real production data instead')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
