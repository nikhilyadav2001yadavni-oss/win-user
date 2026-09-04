
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileDocuments } from "./_components/profile-documents";
import { ProfileHeader } from "./_components/profile-header";
import { ChangePassword } from "./_components/change-password";
import { PersonalDetails } from "./_components/profile-personal-details";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 py-4" data-content-padding="false">
      <ProfileHeader />

      <Tabs className="min-h-0 flex-1 gap-0" defaultValue="personal">
        <div className="scrollbar-none touch-pan-x overflow-x-auto overscroll-x-contain border-y">
          <TabsList
            className="w-max min-w-full justify-start gap-4 px-4 *:data-[slot=tabs-trigger]:flex-none"
            variant="line"
          >
            <TabsTrigger value="personal">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
        </div>

        <div className="px-4 md:px-6">

          <TabsContent className="py-4" value="personal">
            <PersonalDetails />
          </TabsContent>

          <TabsContent className="py-4" value="security">
            <ChangePassword />
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
