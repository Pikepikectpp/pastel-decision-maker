
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Grid3X3 } from "lucide-react";
import WeightedProsConsMode from "@/components/WeightedProsConsMode";
import DecisionMatrixMode from "@/components/DecisionMatrixMode";

const Index = () => {
  const [currentMode, setCurrentMode] = useState<"select" | "proscons" | "matrix">("select");

  const handleModeSelect = (mode: "proscons" | "matrix") => {
    setCurrentMode(mode);
  };

  const handleBackToSelect = () => {
    setCurrentMode("select");
  };

  if (currentMode === "proscons") {
    return <WeightedProsConsMode onBack={handleBackToSelect} />;
  }

  if (currentMode === "matrix") {
    return <DecisionMatrixMode onBack={handleBackToSelect} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Decision Helper</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Make better decisions with our minimalist tools. Choose your approach below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card 
            className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={() => handleModeSelect("proscons")}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scale className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Weighted Pros & Cons</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                List the advantages and disadvantages of a single decision with weighted importance. 
                Perfect for yes/no decisions.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-md"
                size="lg"
              >
                Start Pros & Cons
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={() => handleModeSelect("matrix")}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid3X3 className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Decision Matrix</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Compare multiple options across weighted criteria. 
                Ideal for choosing between several alternatives.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-md"
                size="lg"
              >
                Start Decision Matrix
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
