import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES } from "./routes";
import { LandingScreen } from "./screens/landing/LandingScreen";
import { LoginScreen } from "./screens/auth/LoginScreen";
import { RegisterScreen } from "./screens/auth/RegisterScreen";
import { SelectCenterScreen } from "./screens/auth/SelectCenterScreen";
import { AppLayout } from "./screens/app/AppLayout";
import { WorkspaceScreen } from "./screens/app/WorkspaceScreen";
import { TopicScreen } from "./screens/app/TopicScreen";
import { TestsScreen } from "./screens/app/TestsScreen";
import { TestRunScreen } from "./screens/app/TestRunScreen";
import { AttemptResultScreen } from "./screens/app/AttemptResultScreen";
import { ChangePasswordScreen } from "./screens/app/ChangePasswordScreen";
import { PlaceholderScreen } from "./screens/app/PlaceholderScreen";
import { TasksScreen } from "./screens/app/TasksScreen";
import { TaskDetailScreen } from "./screens/app/TaskDetailScreen";
import { InterviewScreen } from "./screens/app/InterviewScreen";
import { InterviewRunScreen } from "./screens/app/InterviewRunScreen";
import { TeacherLayout } from "./screens/teacher/TeacherLayout";
import { TeacherHomeScreen } from "./screens/teacher/TeacherHomeScreen";
import { ManageTasksScreen } from "./screens/teacher/ManageTasksScreen";
import { ManageTaskDetailScreen } from "./screens/teacher/ManageTaskDetailScreen";
import { StudentTwinScreen } from "./screens/teacher/StudentTwinScreen";
import { ClassTwinScreen } from "./screens/teacher/ClassTwinScreen";
import { SettingsScreen } from "./screens/teacher/SettingsScreen";
import { SuperAdminLayout } from "./screens/superadmin/SuperAdminLayout";
import { SuperAdminHomeScreen } from "./screens/superadmin/SuperAdminHomeScreen";
import { SuperAdminSettingsScreen } from "./screens/superadmin/SuperAdminSettingsScreen";
import { AdminHomeScreen } from "./screens/admin/AdminHomeScreen";
import { HealthScreen } from "./screens/dev/HealthScreen";
import { UiKitScreen } from "./screens/dev/UiKitScreen";
import { RequireAuth } from "./features/auth/RequireAuth";

const router = createBrowserRouter([
  { path: ROUTES.home, element: <LandingScreen /> },
  { path: ROUTES.login, element: <LoginScreen /> },
  { path: ROUTES.register, element: <RegisterScreen /> },
  {
    path: ROUTES.selectCenter,
    element: (
      <RequireAuth>
        <SelectCenterScreen />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.changePassword,
    element: (
      <RequireAuth>
        <ChangePasswordScreen />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.app,
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <WorkspaceScreen />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/app/topics/:topicId",
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <TopicScreen />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.studentTests,
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <TestsScreen />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/app/tests/:testId",
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <TestRunScreen />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/app/attempts/:attemptId",
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <AttemptResultScreen />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.studentTasks,
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <TasksScreen />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/app/tasks/:assignmentId",
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <TaskDetailScreen />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.studentInterview,
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <InterviewScreen />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/app/interview/:sessionId",
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <InterviewRunScreen />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.studentBattle,
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <PlaceholderScreen title="Battle" />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.studentProfile,
    element: (
      <RequireAuth allowedRoles={["STUDENT"]}>
        <AppLayout>
          <PlaceholderScreen title="Profil" />
        </AppLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.teacher,
    element: (
      <RequireAuth allowedRoles={["TEACHER"]}>
        <TeacherLayout>
          <TeacherHomeScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.teacherTasks,
    element: (
      <RequireAuth allowedRoles={["TEACHER"]}>
        <TeacherLayout>
          <ManageTasksScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/teacher/tasks/:assignmentId",
    element: (
      <RequireAuth allowedRoles={["TEACHER"]}>
        <TeacherLayout>
          <ManageTaskDetailScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.teacherStudents,
    element: (
      <RequireAuth allowedRoles={["TEACHER"]}>
        <TeacherLayout>
          <ClassTwinScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/teacher/students/:studentId/digital-twin",
    element: (
      <RequireAuth allowedRoles={["TEACHER"]}>
        <TeacherLayout>
          <StudentTwinScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.teacherSettings,
    element: (
      <RequireAuth allowedRoles={["TEACHER"]}>
        <TeacherLayout>
          <SettingsScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.superadmin,
    element: (
      <RequireAuth requireSuperAdmin>
        <SuperAdminLayout>
          <SuperAdminHomeScreen />
        </SuperAdminLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.superadminSettings,
    element: (
      <RequireAuth requireSuperAdmin>
        <SuperAdminLayout>
          <SuperAdminSettingsScreen />
        </SuperAdminLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.admin,
    element: (
      <RequireAuth allowedRoles={["CENTER_ADMIN"]}>
        <AdminHomeScreen />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.adminTasks,
    element: (
      <RequireAuth allowedRoles={["CENTER_ADMIN"]}>
        <TeacherLayout>
          <ManageTasksScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/admin/tasks/:assignmentId",
    element: (
      <RequireAuth allowedRoles={["CENTER_ADMIN"]}>
        <TeacherLayout>
          <ManageTaskDetailScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.adminStudents,
    element: (
      <RequireAuth allowedRoles={["CENTER_ADMIN"]}>
        <TeacherLayout>
          <ClassTwinScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: "/admin/students/:studentId/digital-twin",
    element: (
      <RequireAuth allowedRoles={["CENTER_ADMIN"]}>
        <TeacherLayout>
          <StudentTwinScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.adminSettings,
    element: (
      <RequireAuth allowedRoles={["CENTER_ADMIN"]}>
        <TeacherLayout>
          <SettingsScreen />
        </TeacherLayout>
      </RequireAuth>
    ),
  },
  ...(import.meta.env.DEV
    ? [
        { path: ROUTES.dev.health, element: <HealthScreen /> },
        { path: ROUTES.dev.uiKit, element: <UiKitScreen /> },
      ]
    : []),
]);

export default function App() {
  return <RouterProvider router={router} />;
}
