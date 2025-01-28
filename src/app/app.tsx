"use server";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/views/app-sidebar";

const App = async () => {
  const session = await auth();
  if (!session) {
    return null;
  }
  return <AppSidebar session={session} />;
};

export default App;
