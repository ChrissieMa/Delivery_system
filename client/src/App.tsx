import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import OrderList from "./pages/OrderList";
import InvoicePrint from "@/pages/InvoicePrint";
import LabelPrint from "@/pages/LabelPrint";
import ShippingNotePrint from "./pages/ShippingNotePrint";
import LabelsPrint from "./pages/LabelsPrint";
import DriverDeliveryNote from "./pages/DriverDeliveryNote";
import BatchDriverNotes from "./pages/BatchDriverNotes";
import CustomerInvoice from "./pages/CustomerInvoice";
import BatchInvoice from "./pages/BatchInvoice";
import PendingDeliveries from "./pages/PendingDeliveries";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={OrderList} />
      <Route path="/pending" component={PendingDeliveries} />
      <Route path="/invoice/:id" component={InvoicePrint} />
      <Route path="/label/:id" component={LabelPrint} />
      <Route path="/shipping/:id" component={ShippingNotePrint} />
      <Route path="/labels/:id" component={LabelsPrint} />
      <Route path="/driver-note/:id" component={DriverDeliveryNote} />
      <Route path="/driver-notes/:ids" component={BatchDriverNotes} />
      <Route path="/customer-invoice/:recordId" component={CustomerInvoice} />
      <Route path="/i/:shippingNo" component={CustomerInvoice} />
      <Route path="/batch-invoice/:ids" component={BatchInvoice} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
