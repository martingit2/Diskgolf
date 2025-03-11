-- DropForeignKey
ALTER TABLE "Basket" DROP CONSTRAINT "Basket_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_courseId_fkey";

-- DropForeignKey
ALTER TABLE "OB" DROP CONSTRAINT "OB_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Start" DROP CONSTRAINT "Start_courseId_fkey";

-- AddForeignKey
ALTER TABLE "Start" ADD CONSTRAINT "Start_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Basket" ADD CONSTRAINT "Basket_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OB" ADD CONSTRAINT "OB_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
