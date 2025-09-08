import { useState, useEffect } from "react";
import { Star, Check, X, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quiz, QuizQuestion } from "@/types";
import { storageUtils } from "@/utils/storage";
import { authStorage } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";

interface QuizSectionProps {
  onNavigate: (view: string) => void;
}

const QuizSection = ({ onNavigate }: QuizSectionProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { toast } = useToast();
  
  const user = authStorage.getUser();

  useEffect(() => {
    setQuizzes(storageUtils.getQuizzes());
  }, []);

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setQuizCompleted(false);
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (!currentQuiz || selectedAnswer === null) return;
    
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        completeQuiz();
      }
    }, 2000);
  };

  const completeQuiz = () => {
    if (!currentQuiz || !user) return;
    
    const percentage = (score / currentQuiz.questions.length) * 100;
    const earnedPoints = Math.floor((percentage / 100) * currentQuiz.points);
    
    // Update user points and quiz completion
    storageUtils.updateUserProfile(user.id, {
      points: (storageUtils.getUserProfile(user.id)?.points || 0) + earnedPoints
    });
    
    storageUtils.markQuizCompleted(currentQuiz.id, user.id);
    
    setQuizCompleted(true);
    
    toast({
      title: "Quiz Completed!",
      description: `You earned ${earnedPoints} points! Score: ${score}/${currentQuiz.questions.length}`
    });
  };

  if (currentQuiz && !quizCompleted) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const isAnswered = selectedAnswer !== null;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setCurrentQuiz(null)}>
              ←
            </Button>
            <div className="text-center">
              <h2 className="font-semibold">{currentQuiz.title}</h2>
              <p className="text-sm text-gray-500">
                {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{score}</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
              />
            </div>
            
            <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Card 
                key={index}
                className={`p-4 cursor-pointer transition-all ${
                  selectedAnswer === index 
                    ? showResult
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-truth-green text-white border-truth-green'
                        : 'bg-false-red text-white border-false-red'
                      : 'bg-primary text-white border-primary'
                    : showResult && index === currentQuestion.correctAnswer
                      ? 'bg-truth-green text-white border-truth-green'
                      : 'hover:bg-gray-50'
                }`}
                onClick={() => !showResult && handleAnswer(index)}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && (
                    <>
                      {index === currentQuestion.correctAnswer && <Check className="w-5 h-5" />}
                      {selectedAnswer === index && index !== currentQuestion.correctAnswer && <X className="w-5 h-5" />}
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {showResult && (
            <Card className="mt-6 p-4 bg-blue-50">
              <p className="text-sm font-medium mb-2">
                {isCorrect ? "Correct! 🎉" : "Incorrect 😔"}
              </p>
              <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
            </Card>
          )}

          {isAnswered && !showResult && (
            <Button 
              className="w-full mt-6 bg-gradient-primary"
              onClick={nextQuestion}
            >
              {currentQuestionIndex === currentQuiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (quizCompleted && currentQuiz) {
    const percentage = (score / currentQuiz.questions.length) * 100;
    const earnedPoints = Math.floor((percentage / 100) * currentQuiz.points);

    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 mb-4">
              You scored {score} out of {currentQuiz.questions.length} questions correctly
            </p>
            
            <div className="bg-gradient-primary text-white p-4 rounded-xl mb-6">
              <p className="text-sm mb-1">Points Earned</p>
              <p className="text-2xl font-bold">+{earnedPoints}</p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => {
                  setCurrentQuiz(null);
                  setQuizCompleted(false);
                }}
              >
                Take Another Quiz
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => onNavigate("home")}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => onNavigate("home")}>
            ←
          </Button>
          <h2 className="font-semibold text-lg ml-2">Myth-Busting Quizzes</h2>
        </div>
      </div>

      {/* Quizzes */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const isCompleted = quiz.completedBy.includes(user?.id || "");
            
            return (
              <Card key={quiz.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{quiz.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{quiz.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs">{quiz.points} points</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{quiz.questions.length} questions</p>
                  </div>
                  
                  {isCompleted && (
                    <Badge className="bg-truth-green">
                      <Check className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                
                <Button 
                  className="w-full"
                  variant={isCompleted ? "outline" : "default"}
                  onClick={() => startQuiz(quiz)}
                  disabled={!user}
                >
                  {isCompleted ? "Retake Quiz" : "Start Quiz"}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizSection;