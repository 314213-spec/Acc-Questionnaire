"use client";

import { useState, useEffect } from 'react';
import { ArrowDown, BrainCircuit, LineChart, CheckCircle, Database, Layout, Users, Star, Lightbulb, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

// Next.js 要求 NEXT_PUBLIC_ 環境變數必須以靜態方式存取，才能在建置時正確嵌入
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${(totalScroll / windowHeight) * 100}`;
      setScrollProgress(Number(scroll));
      const sectionIndex = Math.round(totalScroll / window.innerHeight);
      setActiveSection(sectionIndex);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert("請至少填寫一題再送出唷！");
      return;
    }

    setIsSubmitting(true);

    // 如果環境變數不存在（例如在線上預覽環境中），則進入模擬送出模式
    if (!supabaseUrl || !supabaseKey) {
      setTimeout(() => {
        alert("【模擬送出成功】\n目前找不到 Supabase 金鑰，所以這是模擬畫面。若要真實連線，請在本地端設定 .env.local 並重新啟動！");
        setIsSuccess(true);
        setIsSubmitting(false);
      }, 1500);
      return;
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/survey_responses`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          q_age: answers.q_age,
          q_occupation: answers.q_occupation,
          q_accounting_exp: answers.q_accounting_exp,
          q_opinion: answers.q_opinion,
          q_dislike_reason: answers.q_dislike_reason,
          q_ai_help: answers.q_ai_help,
          q_learning_struggle: answers.q_learning_struggle,
          q_ai_accuracy: answers.q_ai_accuracy,
          q_motivation: answers.q_motivation,
          q_feedback: answers.q_feedback
        })
      });

      if (!response.ok) throw new Error("傳送資料失敗"); 

      setIsSuccess(true);
      
    } catch (error: any) {
      console.error("送出失敗:", error);
      alert("抱歉，送出時發生錯誤，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scenes = [
    { 
      id: "intro", title: "序幕：會計 AI 桌遊體驗", desc: "歡迎填寫回饋問卷，幫助我們變得更好！", 
      icon: <Layout className="w-32 h-32 text-blue-400 opacity-80" />, bg: "bg-slate-900",
      content: (
        <div className="text-slate-300 text-left space-y-5 text-base md:text-lg leading-loose tracking-wide">
          <p>親愛的同學，你（妳）好！這份問卷是用來瞭解你（妳）遊玩此桌遊後的看法，沒有標準答案，也不會影響你（妳）的學業成績，你（妳）可以放心地回答問題。</p>
          <p>共10題，請根據你（妳）個人的感受，回答最適合的答案。此問卷僅用於改進桌遊，不會對外公布與濫用。</p>
          <p className="text-center text-blue-400 font-bold mt-8 tracking-normal">請向下滾動，我們將從幾個基本問題開始。</p>
        </div>
      )
    },
    { 
      id: "q1", title: "基本問題", desc: "了解你的背景", 
      icon: <Users className="w-32 h-32 text-emerald-400 opacity-80" />, bg: "bg-teal-950",
      type: "choice", questionId: "q_age", questionText: "1. 請問你的年齡大約落在哪個區間？",
      options: ["18 歲以下", "18 - 24 歲", "25 - 34 歲", "35 歲以上"]
    },
    { 
      id: "q2", title: "基本問題", desc: "了解你的背景", 
      icon: <Database className="w-32 h-32 text-cyan-400 opacity-80" />, bg: "bg-cyan-950",
      type: "text", questionId: "q_occupation", questionText: "2. 請問你的職業或科系是？"
    },
    { 
      id: "q3", title: "基本問題", desc: "會計熟悉度", 
      icon: <LineChart className="w-32 h-32 text-indigo-400 opacity-80" />, bg: "bg-indigo-950",
      type: "choice", questionId: "q_accounting_exp", questionText: "3. 在玩這款桌遊前，你對會計的了解程度？",
      options: ["完全沒學過", "剛開始學", "已經學了一段時間", "偶是大佬"]
    },
    { 
      id: "q4", title: "基本問題", desc: "對會計的看法", 
      icon: <MessageSquare className="w-32 h-32 text-purple-400 opacity-80" />, bg: "bg-purple-950",
      type: "choice", questionId: "q_opinion", questionText: "4. 你對「會計」這個科目的整體看法是？",
      options: ["覺得很有趣、很實用", "普通，就是一門必修/學科", "覺得有點困難、枯燥", "非常排斥，完全不想碰"]
    },
    { 
      id: "q5", title: "基本問題", desc: "學習阻礙", 
      icon: <AlertCircle className="w-32 h-32 text-pink-400 opacity-80" />, bg: "bg-pink-950",
      type: "choice", questionId: "q_dislike_reason", questionText: "5. 若要說一個讓你「不想」學習會計的原因，最可能是什麼？",
      options: ["專有名詞與法規太複雜", "數字太多、計算繁瑣", "覺得枯燥乏味，缺乏實用感", "我沒有不想學（我很樂意學習）"]
    },
    { 
      id: "q6", title: "深入體驗", desc: "AI 客製化的影響", 
      icon: <BrainCircuit className="w-32 h-32 text-blue-400 opacity-80" />, bg: "bg-blue-950",
      type: "rating", maxScore: 5, questionId: "q_ai_help", questionText: "6. 你認為結合 AI 客製化回答問題，對你學習會計有無幫助？(1=毫無幫助, 5=非常有幫助)"
    },
    { 
      id: "q7", title: "深入體驗", desc: "學習痛點", 
      icon: <AlertCircle className="w-32 h-32 text-orange-400 opacity-80" />, bg: "bg-orange-950",
      type: "text", questionId: "q_learning_struggle", questionText: "7. 你在學習會計的時候有無遇到困境？(若有，請簡述)"
    },
    { 
      id: "q8", title: "深入體驗", desc: "AI 準確度評分", 
      icon: <Star className="w-32 h-32 text-yellow-400 opacity-80" />, bg: "bg-amber-950",
      type: "rating", maxScore: 5, questionId: "q_ai_accuracy", questionText: "8. AI 是否能準確回答你在遊戲中或會計上遇到的問題？(1=非常不準確, 5=非常準確)"
    },
    { 
      id: "q9", title: "深入體驗", desc: "學習動機提升", 
      icon: <Lightbulb className="w-32 h-32 text-lime-400 opacity-80" />, bg: "bg-lime-950",
      type: "rating", maxScore: 5, questionId: "q_motivation", questionText: "9. 這款遊戲與 AI 的結合，讓我更想學習會計 (1=完全不想, 5=非常想)"
    },
    { 
      id: "q10", title: "深入體驗", desc: "尋找優化的可能", 
      icon: <Database className="w-32 h-32 text-red-400 opacity-80" />, bg: "bg-red-950",
      type: "text", questionId: "q_feedback", questionText: "10. 在玩遊戲或使用 AI 時，你有遇到什麼卡關或覺得設計不好的地方嗎？(開放問題)"
    },
    { 
      id: "outro", title: "終幕：回饋封裝", desc: "感謝你的寶貴意見！", 
      icon: <CheckCircle className="w-32 h-32 text-green-400 opacity-80" />, bg: "bg-slate-900",
      content: isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">送出成功！</h3>
          <p className="text-slate-300 text-center">感謝你的回饋，這將幫助我們打造更好的會計 AI 桌遊。<br/>你可以安全地關閉此網頁了。</p>
        </div>
      ) : (
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg text-lg font-bold hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> 資料傳送中...</>
          ) : (
            "確認送出問卷"
          )}
        </button>
      )
    }
  ];

  return (
    <div className="relative w-full min-h-screen text-slate-100 transition-colors duration-700">
      <div className="fixed top-0 left-0 w-full h-2 bg-slate-800 z-50">
        <div className="h-full bg-blue-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      <div className="flex flex-col md:flex-row">
        <div className={`w-full md:w-1/2 h-screen sticky top-0 flex flex-col items-center justify-center p-8 border-r border-slate-700/50 shadow-2xl z-0 transition-colors duration-700 ${scenes[activeSection]?.bg || 'bg-slate-900'}`}>
          <div className="relative flex flex-col items-center">
            {scenes[activeSection] && (
              <div key={activeSection} className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                <div className="mb-8">{scenes[activeSection].icon}</div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-wider mb-4">{scenes[activeSection].title}</h2>
                <p className="text-slate-400 text-lg">{scenes[activeSection].desc}</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-8 flex flex-col items-center text-slate-500">
            <span className="text-sm mb-2 font-mono">SCROLL</span>
            <ArrowDown className="animate-bounce w-5 h-5" />
          </div>
        </div>

        <div className="w-full md:w-1/2 relative z-10 bg-slate-900/50">
          {scenes.map((scene, index) => (
            <section key={scene.id} className="min-h-screen flex flex-col justify-center px-6 py-20 md:px-16">
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 p-8 rounded-2xl shadow-2xl hover:border-blue-500/30 transition-all duration-300">
                
                {index > 0 && index < scenes.length - 1 && (
                  <div className="text-blue-400 font-mono text-sm mb-4">// 第 {index} 題</div>
                )}
                
                {scene.content ? (
                  scene.content
                ) : (
                  <>
                    <h3 className="text-xl md:text-2xl font-bold mb-8 text-white leading-relaxed">{scene.questionText}</h3>
                    
                    {scene.type === 'rating' && scene.questionId && (
                      <div className="flex flex-wrap gap-3">
                        {Array.from({ length: scene.maxScore || 5 }, (_, i) => i + 1).map(score => (
                          <button
                            key={score}
                            onClick={() => handleAnswer(scene.questionId!, score)}
                            className={`w-12 h-12 flex items-center justify-center rounded-full border-2 font-bold transition-all ${
                              answers[scene.questionId!] === score 
                                ? 'bg-blue-500 border-blue-500 text-white scale-110 shadow-lg shadow-blue-500/50' 
                                : 'border-slate-600 text-slate-400 hover:border-blue-400 hover:text-blue-300 bg-slate-900/50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    )}

                    {scene.type === 'choice' && scene.questionId && scene.options && (
                      <div className="flex flex-col gap-4">
                        {scene.options.map(option => (
                          <button
                            key={option}
                            onClick={() => handleAnswer(scene.questionId!, option)}
                            className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                              answers[scene.questionId!] === option
                                ? 'bg-blue-500/20 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {scene.type === 'text' && scene.questionId && (
                      <textarea
                        rows={5}
                        placeholder="請輸入..."
                        value={answers[scene.questionId!] || ''}
                        onChange={(e) => handleAnswer(scene.questionId!, e.target.value)}
                        className="w-full bg-slate-900/80 border-2 border-slate-700 rounded-xl p-5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-lg"
                      />
                    )}
                  </>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}