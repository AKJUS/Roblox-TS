import { TranslationProvider } from "@rbx/core-scripts/react";
import ReminderOfNormsProvider from "./hooks/ReminderOfNormsProvider";
import ReminderOfNormsDialog from "./components/ReminderOfNormsDialog";
import "./reminderOfNorms.scss";

function App(): JSX.Element {
  return (
    <TranslationProvider config={["Feature.Home"]}>
      <ReminderOfNormsProvider>
        <ReminderOfNormsDialog />
      </ReminderOfNormsProvider>
    </TranslationProvider>
  );
}

export default App;
