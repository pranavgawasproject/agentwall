import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/page";
import { InterceptPlayground } from "@/components/intercept-playground";

export const Route = createFileRoute("/intercept")({
  component: InterceptPage,
});

function InterceptPage() {
  return (
    <Page>
      <InterceptPlayground />
    </Page>
  );
}