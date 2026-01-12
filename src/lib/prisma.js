import { PrismaClient, Prisma } from "@prisma/client"
import { defaultOverlays, defaultPages, defaultSliderCart } from "./prisma-default-values"

let prisma

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
