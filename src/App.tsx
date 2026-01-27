import { Route, Routes } from "react-router-dom";
import SearchPage from "./pages/search";
import WorkPage from "./pages/work";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Music Catalogue
          </h1>
        </header>

        <Routes>
          <Route index element={<SearchPage />} />
          <Route path="/work/:workId" element={<WorkPage />} />
        </Routes>
      </div>
    </div>
  );
}
