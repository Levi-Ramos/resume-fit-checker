import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12 md:py-16">
        <Skeleton className="h-4 w-16" />

        <Card>
          <CardHeader>
            <CardTitle>Your resume</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full md:h-96" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
