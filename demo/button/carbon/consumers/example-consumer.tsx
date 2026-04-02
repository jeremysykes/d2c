import { Button } from "../Button";

export function ExamplePage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Button label="Save changes" kind="primary" size="lg" />
      <Button label="Cancel" kind="secondary" size="lg" />
      <Button label="Delete" kind="danger-primary" size="md" />
    </div>
  );
}
