-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_prerequisites" (
    "topicId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,

    CONSTRAINT "topic_prerequisites_pkey" PRIMARY KEY ("topicId","prerequisiteId")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctOptionId" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_questions" (
    "testId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "test_questions_pkey" PRIMARY KEY ("testId","questionId")
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_gaps" (
    "id" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "rootTopicId" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT,
    "attemptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_gaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "next_steps" (
    "id" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "gapId" TEXT,
    "topicId" TEXT NOT NULL,
    "materialId" TEXT,
    "instruction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "next_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_stats" (
    "id" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "streakRecord" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "achievements" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "student_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_messages" (
    "id" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");

-- CreateIndex
CREATE INDEX "topics_subjectId_order_idx" ON "topics"("subjectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "topics_subjectId_slug_key" ON "topics"("subjectId", "slug");

-- CreateIndex
CREATE INDEX "materials_topicId_idx" ON "materials"("topicId");

-- CreateIndex
CREATE INDEX "questions_topicId_idx" ON "questions"("topicId");

-- CreateIndex
CREATE INDEX "tests_topicId_idx" ON "tests"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "test_questions_testId_order_key" ON "test_questions"("testId", "order");

-- CreateIndex
CREATE INDEX "test_attempts_centerId_studentId_idx" ON "test_attempts"("centerId", "studentId");

-- CreateIndex
CREATE INDEX "test_attempts_testId_idx" ON "test_attempts"("testId");

-- CreateIndex
CREATE INDEX "answers_attemptId_idx" ON "answers"("attemptId");

-- CreateIndex
CREATE INDEX "knowledge_gaps_centerId_studentId_topicId_idx" ON "knowledge_gaps"("centerId", "studentId", "topicId");

-- CreateIndex
CREATE INDEX "next_steps_centerId_studentId_status_createdAt_idx" ON "next_steps"("centerId", "studentId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "student_stats_studentId_key" ON "student_stats"("studentId");

-- CreateIndex
CREATE INDEX "student_stats_centerId_xp_idx" ON "student_stats"("centerId", "xp");

-- CreateIndex
CREATE INDEX "mentor_messages_centerId_studentId_createdAt_idx" ON "mentor_messages"("centerId", "studentId", "createdAt");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_prerequisites" ADD CONSTRAINT "topic_prerequisites_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_prerequisites" ADD CONSTRAINT "topic_prerequisites_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_gaps" ADD CONSTRAINT "knowledge_gaps_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_gaps" ADD CONSTRAINT "knowledge_gaps_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_gaps" ADD CONSTRAINT "knowledge_gaps_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_gaps" ADD CONSTRAINT "knowledge_gaps_rootTopicId_fkey" FOREIGN KEY ("rootTopicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_gaps" ADD CONSTRAINT "knowledge_gaps_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "test_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "next_steps" ADD CONSTRAINT "next_steps_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "next_steps" ADD CONSTRAINT "next_steps_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "next_steps" ADD CONSTRAINT "next_steps_gapId_fkey" FOREIGN KEY ("gapId") REFERENCES "knowledge_gaps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "next_steps" ADD CONSTRAINT "next_steps_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "next_steps" ADD CONSTRAINT "next_steps_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_stats" ADD CONSTRAINT "student_stats_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_stats" ADD CONSTRAINT "student_stats_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_messages" ADD CONSTRAINT "mentor_messages_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_messages" ADD CONSTRAINT "mentor_messages_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
