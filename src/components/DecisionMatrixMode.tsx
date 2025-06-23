
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Trash2, RotateCcw, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Criterion {
  id: string;
  name: string;
  weight: number;
}

interface Alternative {
  id: string;
  name: string;
}

interface Rating {
  alternativeId: string;
  criterionId: string;
  score: number;
}

interface DecisionMatrixModeProps {
  onBack: () => void;
}

const DecisionMatrixMode = ({ onBack }: DecisionMatrixModeProps) => {
  const [decisionTitle, setDecisionTitle] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [newCriterionName, setNewCriterionName] = useState("");
  const [newAlternativeName, setNewAlternativeName] = useState("");
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("matrix-decision");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDecisionTitle(data.title || "");
        setCriteria(data.criteria || []);
        setAlternatives(data.alternatives || []);
        setRatings(data.ratings || []);
      } catch (error) {
        console.error("Failed to load saved decision:", error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      title: decisionTitle,
      criteria,
      alternatives,
      ratings
    };
    localStorage.setItem("matrix-decision", JSON.stringify(data));
  }, [decisionTitle, criteria, alternatives, ratings]);

  const addCriterion = () => {
    if (!newCriterionName.trim()) return;
    
    const newCriterion: Criterion = {
      id: Date.now().toString(),
      name: newCriterionName.trim(),
      weight: 3
    };
    
    setCriteria([...criteria, newCriterion]);
    setNewCriterionName("");
    toast({
      title: "Criterion added",
      description: `Added "${newCriterion.name}" to criteria`,
    });
  };

  const addAlternative = () => {
    if (!newAlternativeName.trim()) return;
    
    const newAlternative: Alternative = {
      id: Date.now().toString(),
      name: newAlternativeName.trim()
    };
    
    setAlternatives([...alternatives, newAlternative]);
    
    // Initialize ratings for this alternative
    const newRatings = criteria.map(criterion => ({
      alternativeId: newAlternative.id,
      criterionId: criterion.id,
      score: 3
    }));
    setRatings([...ratings, ...newRatings]);
    
    setNewAlternativeName("");
    toast({
      title: "Alternative added",
      description: `Added "${newAlternative.name}" to options`,
    });
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
    setRatings(ratings.filter(r => r.criterionId !== id));
  };

  const removeAlternative = (id: string) => {
    setAlternatives(alternatives.filter(a => a.id !== id));
    setRatings(ratings.filter(r => r.alternativeId !== id));
  };

  const updateCriterionWeight = (id: string, weight: number) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, weight } : c
    ));
  };

  const updateRating = (alternativeId: string, criterionId: string, score: number) => {
    const existingRating = ratings.find(r => 
      r.alternativeId === alternativeId && r.criterionId === criterionId
    );
    
    if (existingRating) {
      setRatings(ratings.map(r => 
        r.alternativeId === alternativeId && r.criterionId === criterionId 
          ? { ...r, score } : r
      ));
    } else {
      setRatings([...ratings, { alternativeId, criterionId, score }]);
    }
  };

  const getRating = (alternativeId: string, criterionId: string): number => {
    const rating = ratings.find(r => 
      r.alternativeId === alternativeId && r.criterionId === criterionId
    );
    return rating?.score || 3;
  };

  const calculateScore = (alternativeId: string): number => {
    return criteria.reduce((total, criterion) => {
      const rating = getRating(alternativeId, criterion.id);
      return total + (rating * criterion.weight);
    }, 0);
  };

  const getAlternativeScores = () => {
    return alternatives.map(alt => ({
      ...alt,
      score: calculateScore(alt.id)
    })).sort((a, b) => b.score - a.score);
  };

  const clearAll = () => {
    setDecisionTitle("");
    setCriteria([]);
    setAlternatives([]);
    setRatings([]);
    localStorage.removeItem("matrix-decision");
    toast({
      title: "Cleared",
      description: "All data has been reset",
    });
  };

  const alternativeScores = getAlternativeScores();
  const maxScore = alternativeScores[0]?.score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Modes
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Decision Matrix</h1>
        </div>

        <div className="space-y-6">
          {/* Decision Title */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0">
            <Label htmlFor="decision-title" className="text-lg font-medium text-slate-700 mb-2 block">
              What decision are you making?
            </Label>
            <Input
              id="decision-title"
              value={decisionTitle}
              onChange={(e) => setDecisionTitle(e.target.value)}
              placeholder="e.g., Which country to move to?"
              className="text-lg border-0 bg-slate-50 focus:bg-white transition-colors"
            />
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Criteria */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-0">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">Decision Criteria</h2>
              
              <div className="flex gap-2 mb-4">
                <Input
                  value={newCriterionName}
                  onChange={(e) => setNewCriterionName(e.target.value)}
                  placeholder="e.g., Cost, Safety, Culture"
                  className="flex-1 border-0 bg-white/60"
                  onKeyPress={(e) => e.key === "Enter" && addCriterion()}
                />
                <Button onClick={addCriterion} className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="bg-white/60 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-slate-700">{criterion.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriterion(criterion.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Importance: {criterion.weight}</Label>
                      <Slider
                        value={[criterion.weight]}
                        onValueChange={(value) => updateCriterionWeight(criterion.id, value[0])}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
                {criteria.length === 0 && (
                  <p className="text-purple-600/60 text-center py-8">No criteria added yet</p>
                )}
              </div>
            </Card>

            {/* Alternatives */}
            <Card className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-0">
              <h2 className="text-xl font-semibold text-teal-800 mb-4">Alternatives</h2>
              
              <div className="flex gap-2 mb-4">
                <Input
                  value={newAlternativeName}
                  onChange={(e) => setNewAlternativeName(e.target.value)}
                  placeholder="e.g., Japan, Germany, UAE"
                  className="flex-1 border-0 bg-white/60"
                  onKeyPress={(e) => e.key === "Enter" && addAlternative()}
                />
                <Button onClick={addAlternative} className="bg-teal-500 hover:bg-teal-600">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {alternatives.map((alternative) => (
                  <div key={alternative.id} className="bg-white/60 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-slate-700">{alternative.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAlternative(alternative.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {alternatives.length === 0 && (
                  <p className="text-teal-600/60 text-center py-8">No alternatives added yet</p>
                )}
              </div>
            </Card>
          </div>

          {/* Rating Matrix */}
          {criteria.length > 0 && alternatives.length > 0 && (
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Rating Matrix</h2>
              
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${criteria.length}, 1fr)` }}>
                    {/* Header */}
                    <div></div>
                    {criteria.map((criterion) => (
                      <div key={criterion.id} className="text-center p-2">
                        <div className="font-medium text-slate-700 mb-1">{criterion.name}</div>
                        <div className="text-xs text-slate-500">Weight: {criterion.weight}</div>
                      </div>
                    ))}
                    
                    {/* Rows */}
                    {alternatives.map((alternative) => (
                      <React.Fragment key={alternative.id}>
                        <div className="flex items-center font-medium text-slate-700 pr-4">
                          {alternative.name}
                        </div>
                        {criteria.map((criterion) => (
                          <div key={`${alternative.id}-${criterion.id}`} className="p-2">
                            <div className="text-center mb-2 text-sm text-slate-600">
                              {getRating(alternative.id, criterion.id)}
                            </div>
                            <Slider
                              value={[getRating(alternative.id, criterion.id)]}
                              onValueChange={(value) => updateRating(alternative.id, criterion.id, value[0])}
                              max={5}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Results */}
          {alternativeScores.length > 0 && (
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-0">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">Results</h2>
              
              <div className="space-y-4">
                {alternativeScores.map((alternative, index) => (
                  <div 
                    key={alternative.id} 
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      index === 0 
                        ? "bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 shadow-lg" 
                        : "bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {index === 0 && <Trophy className="w-6 h-6 text-yellow-600" />}
                      <div>
                        <h3 className={`font-semibold ${index === 0 ? "text-yellow-800 text-lg" : "text-slate-700"}`}>
                          {alternative.name}
                        </h3>
                        {index === 0 && <p className="text-sm text-yellow-600">Best Choice</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${index === 0 ? "text-yellow-700" : "text-slate-600"}`}>
                        {alternative.score.toFixed(1)}
                      </div>
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            index === 0 ? "bg-yellow-500" : "bg-slate-400"
                          }`}
                          style={{ width: `${maxScore > 0 ? (alternative.score / maxScore) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={clearAll}
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionMatrixMode;
