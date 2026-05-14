import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Camera,
  Check,
  Code,
  CreditCard,
  Hash,
  Mail,
  Moon,
  Play,
  Sparkles,
  Sun,
  UserPlus,
  X,
  Zap,
} from 'lucide-react'
import OnboardingChecklist from './components/OnboardingChecklist'
import { cn } from './lib/utils'

const MOCK_STEPS = [
  {
    id: 1,
    title: 'Verify your email',
    description: 'Check your inbox for a verification link to secure your account.',
    status: 'Completed',
    subtasks: ['Open verification email', 'Click verify link', 'Login to confirm'],
  },
  {
    id: 2,
    title: 'Complete your profile',
    description: 'Add your photo and basic information to personalize your space.',
    status: 'Active',
    subtasks: ['Upload profile picture', 'Write a short bio'],
  },
  {
    id: 3,
    title: 'Connect your workspace',
    description: 'Integrate your existing tools to streamline your workflow.',
    status: 'Pending',
    subtasks: ['Select your primary tool', 'Authorize API access', 'Sync initial data'],
  },
  {
    id: 4,
    title: 'Invite your teammates',
    description: 'Collaboration is better with others. Invite up to 5 members.',
    status: 'Optional',
    subtasks: ['Enter teammate emails', 'Set permission levels', 'Send invites'],
  },
  {
    id: 5,
    title: 'Add billing',
    description: 'Choose a plan and save one payment method.',
    status: 'Locked',
    subtasks: ['Choose a plan', 'Save billing method'],
  },
  {
    id: 6,
    title: 'Take the product tour',
    description: 'Learn the basics in under 2 minutes.',
    status: 'Pending',
    subtasks: ['Watch intro video', 'Explore dashboard', 'Finish tour'],
  },
]

const STORAGE_KEYS = {
  steps: 'onboarding_steps',
  subtasks: 'onboarding_subtasks',
  theme: 'onboarding_theme',
  profileImage: 'onboarding_profile_image',
}

const readStorageJSON = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

const getSubtaskKey = (guideId, subtaskId) => `${guideId}-${subtaskId}`

function App() {
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem(STORAGE_KEYS.profileImage))
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false)
  const [isInviteSent, setIsInviteSent] = useState(false)
  const [isProfileSaved, setIsProfileSaved] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [billingDetails, setBillingDetails] = useState({
    billingEmail: '',
  })
  const [billingFeedback, setBillingFeedback] = useState({ type: '', message: '' })
  const [showDocs, setShowDocs] = useState(false)
  const [activeGuide, setActiveGuide] = useState(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const [steps, setSteps] = useState(() => {
    const savedSteps = readStorageJSON(STORAGE_KEYS.steps, null)
    if (!savedSteps) return MOCK_STEPS

    return MOCK_STEPS.map((mockStep) => {
      const savedStep = savedSteps.find((step) => step.id === mockStep.id)
      return savedStep ? { ...mockStep, status: savedStep.status } : mockStep
    })
  })

  const [completedSubtasks, setCompletedSubtasks] = useState(() =>
    readStorageJSON(STORAGE_KEYS.subtasks, {})
  )

  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || 'dark')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.steps, JSON.stringify(steps))
  }, [steps])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.subtasks, JSON.stringify(completedSubtasks))
  }, [completedSubtasks])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme)
  }, [theme])

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem(STORAGE_KEYS.profileImage, profileImage)
      return
    }

    localStorage.removeItem(STORAGE_KEYS.profileImage)
  }, [profileImage])

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  const handleLaunchGuide = (step) => {
    setActiveGuide(step)
    setIsVideoPlaying(false)
    setIsMagicLinkSent(false)
    setIsInviteSent(false)
    setBillingFeedback({ type: '', message: '' })
  }

  const handleStepClick = (clickedStep) => {
    if (clickedStep.status === 'Locked') return
    handleLaunchGuide(clickedStep)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setProfileImage(reader.result)
    reader.readAsDataURL(file)
  }

  const toggleSubtask = (guideId, subtaskId) => {
    if (guideId === 5) {
      setBillingFeedback({
        type: 'error',
        message: 'Save the billing form to complete these billing tasks automatically.',
      })
      return
    }

    setCompletedSubtasks((prev) => ({
      ...prev,
      [getSubtaskKey(guideId, subtaskId)]: !prev[getSubtaskKey(guideId, subtaskId)],
    }))
  }

  const markSubtask = (guideId, subtaskId, isDone = true) => {
    setCompletedSubtasks((prev) => ({
      ...prev,
      [getSubtaskKey(guideId, subtaskId)]: isDone,
    }))
  }

  const allSubtasksDone = activeGuide && activeGuide.subtasks?.every((_, index) => completedSubtasks[getSubtaskKey(activeGuide.id, index)])
  const isOptionalGuide = activeGuide?.status === 'Optional'
  const isBillingGuide = activeGuide?.id === 5
  const canAdvanceGuide = Boolean(activeGuide) && (allSubtasksDone || isOptionalGuide)

  const handleBillingInputChange = (field, value) => {
    setBillingDetails((prev) => ({ ...prev, [field]: value }))

    if (billingFeedback.message) {
      setBillingFeedback({ type: '', message: '' })
    }
  }

  const handleSaveBillingMethod = () => {
    const trimmedDetails = {
      billingEmail: billingDetails.billingEmail.trim(),
    }

    const isBillingEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedDetails.billingEmail)

    if (!selectedPlan || !isBillingEmailValid) {
      setBillingFeedback({
        type: 'error',
        message: 'Choose a plan and enter a valid billing email.',
      })
      return
    }

    markSubtask(5, 0)
    markSubtask(5, 1)
    setBillingFeedback({
      type: 'success',
      message: 'Billing saved. Now tap finalize below.',
    })
  }

  const finalizeGuide = () => {
    if (!activeGuide || !canAdvanceGuide) return

    const nextStatus = allSubtasksDone ? 'Completed' : isOptionalGuide ? 'Skipped' : activeGuide.status

    setSteps((prev) => {
      const newSteps = prev.map((step) => (
        step.id === activeGuide.id ? { ...step, status: nextStatus } : step
      ))

      const currentIndex = newSteps.findIndex((step) => step.id === activeGuide.id)
      if (currentIndex < newSteps.length - 1) {
        for (let index = currentIndex + 1; index < newSteps.length; index += 1) {
          const nextStep = newSteps[index]

          if (nextStep.status === 'Optional' || nextStep.status === 'Completed' || nextStep.status === 'Skipped') {
            continue
          }

          if (nextStep.status === 'Locked' || nextStep.status === 'Pending') {
            newSteps[index] = { ...nextStep, status: 'Active' }
          }

          break
        }
      }

      return newSteps
    })

    if (activeGuide.id === 5) {
      setBillingFeedback({ type: '', message: '' })
    }

    setActiveGuide(null)
  }

  const resetInterface = () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
    window.location.reload()
  }

  return (
    <div className={cn(
      'relative flex min-h-screen w-full flex-col overflow-x-hidden p-4 transition-colors duration-700 md:p-12',
      theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
    )}>
      <motion.div
        animate={{
          scale: theme === 'dark' ? [1, 1.1, 1] : [1, 1.2, 1],
          opacity: theme === 'dark' ? [0.07, 0.1, 0.07] : [0.1, 0.2, 0.1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] transition-colors duration-1000',
          theme === 'dark' ? 'bg-blue-600' : 'bg-blue-300'
        )}
      />
      <motion.div
        animate={{
          scale: theme === 'dark' ? [1.1, 1, 1.1] : [1.2, 1, 1.2],
          opacity: theme === 'dark' ? [0.04, 0.08, 0.04] : [0.05, 0.15, 0.05],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'pointer-events-none absolute bottom-0 right-0 h-[700px] w-[700px] translate-x-1/3 translate-y-1/3 rounded-full blur-[160px] transition-colors duration-1000',
          theme === 'dark' ? 'bg-indigo-600' : 'bg-purple-200'
        )}
      />

      <div className="absolute right-8 top-8 z-[150] flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={cn(
            'rounded-2xl border p-4 shadow-xl transition-all duration-500',
            theme === 'dark'
              ? 'border-slate-800 bg-slate-900/50 text-blue-400 shadow-blue-900/20 hover:bg-slate-800'
              : 'border-slate-200 bg-white text-slate-900 shadow-slate-200 hover:bg-slate-50'
          )}
        >
          {theme === 'dark' ? (
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 fill-blue-400" />
              <span className="hidden text-[10px] font-black uppercase tracking-widest md:block">Switch to Light</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 fill-slate-900" />
              <span className="hidden text-[10px] font-black uppercase tracking-widest text-slate-500 md:block">Switch to Dark</span>
            </div>
          )}
        </motion.button>
      </div>

      <main className="z-10 my-auto mx-auto flex w-full max-w-[1200px] flex-col items-center gap-16 overflow-visible py-12 md:py-20">
        <div className="w-full max-w-5xl space-y-8 px-4 text-center md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 shadow-xl shadow-blue-500/5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Activation System Pro v2.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              'mx-auto whitespace-nowrap text-[clamp(1.2rem,4.2vw,3.9rem)] font-black leading-[1.1] tracking-tighter transition-colors duration-500 md:text-[clamp(1.8rem,5vw,4.5rem)]',
              theme === 'dark'
                ? 'bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent'
                : 'text-slate-900'
            )}
          >
            Master the Product Journey
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'mx-auto max-w-xl text-lg font-medium leading-relaxed transition-colors duration-500 md:text-xl',
              theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
            )}
          >
            A production-grade onboarding suite. Features 3D interactive cards,
            state-persistent tracking, and ultra-smooth mobile sheets.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <button
              onClick={() => setShowDocs(true)}
              className={cn(
                'rounded-2xl px-10 py-5 text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 hover:scale-105',
                theme === 'dark'
                  ? 'bg-white text-slate-950 shadow-white/5'
                  : 'bg-slate-900 text-white shadow-slate-900/10'
              )}
            >
              Live Documentation
            </button>
            <button
              onClick={resetInterface}
              className={cn(
                'rounded-2xl border px-10 py-5 text-xs font-black uppercase tracking-widest transition-all active:scale-95',
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/50 text-white backdrop-blur-xl hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              Reset Interface
            </button>
          </motion.div>
        </div>

        <div className="flex w-full justify-center">
          <OnboardingChecklist
            steps={steps}
            theme={theme}
            onStepClick={handleStepClick}
            onLaunchGuide={handleLaunchGuide}
            layoutMode="card"
          />
        </div>
      </main>

      <AnimatePresence>
        {activeGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveGuide(null)}
              className="fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, x: 500 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 500 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'fixed right-0 top-0 z-[200] h-full w-full overflow-y-auto border-l p-6 shadow-2xl transition-colors duration-500 md:w-[500px] md:p-10',
                theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              )}
            >
              <button
                onClick={() => setActiveGuide(null)}
                className={cn(
                  'absolute right-6 top-6 z-50 rounded-2xl border border-transparent p-3 transition-all active:scale-90',
                  theme === 'dark' ? 'text-slate-400 hover:border-slate-700 hover:bg-slate-800' : 'text-slate-500 hover:border-slate-200 hover:bg-slate-100'
                )}
              >
                <X className="h-6 w-6" />
              </button>

              <div className="mt-8 space-y-8">
                <div className={cn(
                  'inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]',
                  theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                )}>
                  Interactive Walkthrough
                </div>
                <h2 className={cn(
                  'text-3xl font-black leading-tight tracking-tighter transition-colors md:text-4xl',
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                )}>
                  {activeGuide.title}
                </h2>
                <p className={cn(
                  'text-md font-medium leading-relaxed transition-colors',
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
                )}>
                  {activeGuide.description}
                </p>

                <div className={cn(
                  'relative overflow-hidden rounded-[2.5rem] border p-8 shadow-inner transition-all',
                  theme === 'dark' ? 'border-blue-500/20 bg-slate-950' : 'border-blue-200 bg-slate-50 shadow-sm'
                )}>
                  {activeGuide.id === 1 && (
                    <div className="space-y-6 py-4 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/10">
                        <Mail className="h-8 w-8 text-blue-400" />
                      </div>
                      <div className="space-y-4">
                        <input
                          type="email"
                          placeholder="confirm@yourdomain.com"
                          className={cn(
                            'w-full rounded-xl border p-4 text-center text-sm outline-none transition-all focus:border-blue-500',
                            theme === 'dark' ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
                          )}
                        />
                        <button
                          onClick={() => {
                            setIsMagicLinkSent(true)
                            setTimeout(() => setIsMagicLinkSent(false), 2000)
                          }}
                          className={cn(
                            'w-full rounded-xl py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-[1.02]',
                            isMagicLinkSent
                              ? 'bg-emerald-500 shadow-emerald-500/20'
                              : 'bg-blue-600 shadow-blue-600/20'
                          )}
                        >
                          {isMagicLinkSent ? 'Magic Link Sent!' : 'Send Magic Link'}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeGuide.id === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div
                          onClick={() => document.getElementById('profile-upload')?.click()}
                          className={cn(
                            'group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all',
                            theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:border-blue-500' : 'border-slate-300 bg-slate-100 hover:border-blue-400'
                          )}
                        >
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                            <Camera className="h-6 w-6 text-slate-500 transition-colors group-hover:text-blue-400" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <input
                          id="profile-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <div className="space-y-1">
                          <p className={cn(
                            'text-sm font-black uppercase tracking-tight transition-colors',
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                          )}>
                            {profileImage ? 'Image Selected' : 'Upload Avatar'}
                          </p>
                          <p className="text-[10px] font-medium text-slate-500">JPG or PNG. Max 5MB.</p>
                        </div>
                      </div>
                      <textarea
                        placeholder="Tell the world about yourself..."
                        className={cn(
                          'h-24 w-full rounded-2xl border p-4 text-sm outline-none transition-all focus:border-blue-500',
                          theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-600'
                        )}
                      />
                      <button
                        onClick={() => {
                          setIsProfileSaved(true)
                          setTimeout(() => setIsProfileSaved(false), 2000)
                        }}
                        className={cn(
                          'w-full rounded-xl border py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95',
                          isProfileSaved
                            ? 'border-emerald-400 bg-emerald-500 text-white'
                            : (theme === 'dark' ? 'border-blue-500/20 bg-blue-600/10 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100')
                        )}
                      >
                        {isProfileSaved ? 'Changes Saved!' : 'Update Preview'}
                      </button>
                    </div>
                  )}

                  {activeGuide.id === 3 && (
                    <div className="space-y-4">
                      {[
                        { name: 'Slack Workspace', icon: <Hash className="h-5 w-5 text-[#E01E5A]" /> },
                        { name: 'Github Org', icon: <Code className={cn('h-5 w-5', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')} /> },
                        { name: 'Discord Server', icon: <Hash className="h-5 w-5 text-[#5865F2]" /> },
                      ].map((tool) => (
                        <div
                          key={tool.name}
                          className={cn(
                            'flex items-center justify-between rounded-2xl border p-4 transition-all',
                            theme === 'dark'
                              ? 'border-slate-800 bg-slate-900/50 hover:border-blue-500/30'
                              : 'border-slate-100 bg-white shadow-sm hover:border-blue-200'
                          )}
                        >
                          <div className="flex items-center gap-4">
                            {tool.icon}
                            <span className={cn(
                              'text-xs font-bold',
                              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                            )}>
                              {tool.name}
                            </span>
                          </div>
                          <button className={cn(
                            'rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors',
                            theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white'
                          )}>
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeGuide.id === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 rounded-2xl border border-blue-500/10 bg-blue-600/5 p-4">
                        <UserPlus className="h-6 w-6 text-blue-400" />
                        <p className="text-[10px] font-bold italic leading-relaxed text-blue-300">
                          "Teams that collaborate early activate 3x faster."
                        </p>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="email"
                          placeholder="teammate@company.com"
                          className={cn(
                            'w-full rounded-xl border p-4 text-sm outline-none transition-all focus:border-blue-500',
                            theme === 'dark' ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
                          )}
                        />
                        <button
                          onClick={() => {
                            setIsInviteSent(true)
                            setTimeout(() => setIsInviteSent(false), 2000)
                          }}
                          className={cn(
                            'w-full rounded-xl py-4 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95',
                            isInviteSent
                              ? 'bg-blue-500 text-white shadow-blue-500/20'
                              : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500'
                          )}
                        >
                          {isInviteSent ? 'Invites Sent!' : 'Send Invitations'}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeGuide.id === 5 && (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {[
                          { name: 'Starter', price: '$19/mo', note: 'Best for solo builders' },
                          { name: 'Growth', price: '$49/mo', note: 'Unlock team collaboration' },
                        ].map((plan, idx) => (
                          <button
                            key={plan.name}
                            onClick={() => {
                              setSelectedPlan(plan.name)
                              markSubtask(5, 0)
                              if (billingFeedback.message) {
                                setBillingFeedback({ type: '', message: '' })
                              }
                            }}
                            className={cn(
                              'rounded-[1.75rem] border p-5 text-left transition-all active:scale-[0.99]',
                              selectedPlan === plan.name
                                ? (theme === 'dark' ? 'border-blue-500/60 bg-blue-600/15 shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/30' : 'border-blue-300 bg-blue-50 shadow-lg shadow-blue-100')
                                : idx === 1
                                ? (theme === 'dark' ? 'border-blue-500/40 bg-blue-600/10 shadow-lg shadow-blue-900/10' : 'border-blue-200 bg-blue-50')
                                : (theme === 'dark' ? 'border-slate-800 bg-slate-900/70 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300')
                            )}
                          >
                            <p className={cn(
                              'text-[10px] font-black uppercase tracking-[0.2em]',
                              idx === 1 ? 'text-blue-400' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')
                            )}>
                              {idx === 1 ? 'Recommended' : 'Plan Option'}
                            </p>
                            <p className={cn(
                              'mt-3 text-2xl font-black tracking-tight',
                              theme === 'dark' ? 'text-white' : 'text-slate-900'
                            )}>
                              {plan.name}
                            </p>
                            <p className="mt-1 text-sm font-bold text-emerald-400">{plan.price}</p>
                            <p className={cn(
                              'mt-3 text-xs font-medium',
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                            )}>
                              {plan.note}
                            </p>
                          </button>
                        ))}
                      </div>

                      <div className={cn(
                        'space-y-5 rounded-[2rem] border p-6 shadow-xl transition-all',
                        theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white'
                      )}>
                        <div className={cn(
                          'rounded-[1.5rem] border px-5 py-4 text-sm leading-relaxed',
                          theme === 'dark' ? 'border-blue-500/20 bg-blue-500/10 text-blue-100' : 'border-blue-200 bg-blue-50 text-blue-700'
                        )}>
                          Choose one plan, enter your billing email, and press save.
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Billing</p>
                            <h4 className={cn(
                              'mt-2 text-xl font-black tracking-tight',
                              theme === 'dark' ? 'text-white' : 'text-slate-900'
                            )}>
                              Save billing
                            </h4>
                          </div>
                          <div className={cn(
                            'rounded-2xl border p-3',
                            theme === 'dark' ? 'border-blue-500/20 bg-blue-600/10' : 'border-blue-200 bg-blue-50'
                          )}>
                            <CreditCard className="h-6 w-6 text-blue-400" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className={cn(
                              'block text-[11px] font-black uppercase tracking-[0.18em]',
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                            )}>
                              Billing Email
                            </label>
                            <input
                              type="email"
                              placeholder="billing@company.com"
                              value={billingDetails.billingEmail}
                              onChange={(e) => handleBillingInputChange('billingEmail', e.target.value)}
                              className={cn(
                                'w-full rounded-xl border p-4 text-sm outline-none transition-all focus:border-blue-500',
                                theme === 'dark' ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'
                              )}
                            />
                          </div>
                        </div>

                        {billingFeedback.message && (
                          <div className={cn(
                            'rounded-2xl border px-4 py-3 text-xs font-bold',
                            billingFeedback.type === 'success'
                              ? (theme === 'dark' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700')
                              : (theme === 'dark' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700')
                          )}>
                            {billingFeedback.message}
                          </div>
                        )}

                        <button
                          onClick={handleSaveBillingMethod}
                          className="w-full rounded-xl bg-blue-600 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-95"
                        >
                          Save Billing
                        </button>
                      </div>
                    </div>
                  )}

                  {activeGuide.id === 6 && (
                    <div className="space-y-6">
                      <div className="group relative aspect-video overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl">
                        {!isVideoPlaying ? (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4">
                            <div
                              onClick={() => setIsVideoPlaying(true)}
                              className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:scale-110 group-hover:shadow-[0_0_60px_rgba(16,185,129,0.6)]"
                            >
                              <Play className="h-8 w-8 fill-current" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-black uppercase tracking-widest text-white">Watch Product Tour</p>
                              <p className="text-[10px] font-medium text-slate-500">1:42 - Feature Walkthrough</p>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            className="h-full w-full"
                            src="https://www.youtube.com/embed/Q3qPyZDzvmY?autoplay=1"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}

                        {!isVideoPlaying && (
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80" />
                        )}
                        <img
                          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"
                          alt="Product Tour Thumbnail"
                          className={cn(
                            'h-full w-full object-cover transition-all duration-700',
                            isVideoPlaying ? 'opacity-0' : 'opacity-40 group-hover:scale-105'
                          )}
                        />
                      </div>
                      <div className="flex items-start gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-600/5 p-5">
                        <Zap className="mt-1 h-5 w-5 text-emerald-400" />
                        <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-tight text-emerald-300">Pro Tip:</p>
                          <p className="text-xs font-medium italic leading-relaxed text-emerald-200/60">
                            "Users who watch the full tour are 4x more likely to find success with our platform tools."
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      'flex items-center gap-2 text-lg font-black uppercase tracking-tight transition-colors',
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    )}>
                      <Check className={cn('h-5 w-5', allSubtasksDone ? 'text-emerald-500' : (theme === 'dark' ? 'text-slate-700' : 'text-slate-300'))} />
                      Execution Checklist:
                    </h4>
                    <span className={cn(
                      'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all',
                      theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-500'
                    )}>
                      {Object.keys(completedSubtasks).filter((key) => key.startsWith(`${activeGuide.id}-`) && completedSubtasks[key]).length} / {activeGuide.subtasks?.length} Done
                    </span>
                  </div>

                  {isBillingGuide && (
                    <div className={cn(
                      'rounded-2xl border px-4 py-3 text-xs font-bold',
                      theme === 'dark' ? 'border-blue-500/20 bg-blue-500/10 text-blue-200' : 'border-blue-200 bg-blue-50 text-blue-700'
                    )}>
                      This billing checklist updates automatically after you choose a plan and save billing.
                    </div>
                  )}

                  <div className="space-y-4">
                    {activeGuide.subtasks?.map((task, index) => {
                      const isDone = completedSubtasks[getSubtaskKey(activeGuide.id, index)]
                      return (
                        <div
                          key={task}
                          onClick={() => toggleSubtask(activeGuide.id, index)}
                          className={cn(
                            'group/item flex items-center gap-4 rounded-2xl border p-5 transition-all',
                            isBillingGuide ? 'cursor-not-allowed' : 'cursor-pointer',
                            isDone
                              ? (theme === 'dark' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50')
                              : (theme === 'dark' ? 'border-slate-800 bg-slate-900 hover:border-slate-700' : 'border-slate-200 bg-white shadow-sm hover:border-blue-200')
                          )}
                        >
                          <div className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all',
                            isDone
                              ? 'border-emerald-400 bg-emerald-500'
                              : (theme === 'dark' ? 'border-slate-700 group-hover/item:border-slate-500' : 'border-slate-300 group-hover/item:border-blue-400')
                          )}>
                            {isDone && <Check className="h-4 w-4 text-white" />}
                          </div>
                          <span className={cn(
                            'text-sm font-bold transition-all',
                            isDone
                              ? (theme === 'dark' ? 'text-emerald-400/70 line-through' : 'text-emerald-600/70 line-through')
                              : (theme === 'dark' ? 'text-slate-300 group-hover/item:text-white' : 'text-slate-700 group-hover/item:text-slate-900')
                          )}>
                            {task}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={finalizeGuide}
                  disabled={!canAdvanceGuide}
                  className={cn(
                    'w-full rounded-[1.5rem] py-5 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95',
                    canAdvanceGuide
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/20 hover:scale-[1.01]'
                      : (theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-500' : 'border-slate-200 bg-slate-100 text-slate-400')
                  )}
                >
                  {allSubtasksDone
                    ? 'Confirm & Finalize Task'
                    : isOptionalGuide
                      ? 'Skip for Now & Continue'
                      : 'Complete Checklist to Finish'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDocs && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDocs(false)}
              className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                'fixed left-1/2 top-1/2 z-[300] max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border p-6 shadow-2xl transition-all duration-500 md:p-10',
                theme === 'dark' ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
              )}
            >
              <button
                onClick={() => setShowDocs(false)}
                className={cn(
                  'absolute right-8 top-8 z-[130] rounded-2xl border border-transparent p-3 transition-all',
                  theme === 'dark' ? 'text-slate-400 hover:border-slate-700 hover:bg-slate-800' : 'text-slate-500 hover:border-slate-200 hover:bg-slate-100'
                )}
              >
                <X className="h-6 w-6" />
              </button>

              <div className="space-y-10 pb-32">
                <div className="space-y-4">
                  <h2 className={cn(
                    'text-4xl font-black uppercase italic tracking-tighter transition-colors',
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    Onboarding Checklist UI Kit
                  </h2>
                  <p className={cn(
                    'text-md font-medium leading-relaxed transition-colors',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  )}>
                    This is the quick documentation bundled with the kit so developers can integrate
                    the onboarding flow directly into their SaaS products.
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className={cn(
                    'border-b pb-2 text-xl font-black uppercase italic transition-colors',
                    theme === 'dark' ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-900'
                  )}>
                    Quick Start
                  </h4>
                  <ul className={cn(
                    'space-y-4 text-sm font-bold transition-colors',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  )}>
                    <li className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      Install dependencies with <code className={cn(theme === 'dark' ? 'rounded bg-slate-950 px-2 py-1 text-blue-400' : 'rounded bg-slate-100 px-2 py-1 text-blue-600')}>npm install</code>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      Run development server with <code className={cn(theme === 'dark' ? 'rounded bg-slate-950 px-2 py-1 text-blue-400' : 'rounded bg-slate-100 px-2 py-1 text-blue-600')}>npm run dev</code>
                    </li>
                  </ul>
                </div>

                <div className="space-y-6">
                  <h4 className={cn(
                    'border-b pb-2 text-xl font-black uppercase italic transition-colors',
                    theme === 'dark' ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-900'
                  )}>
                    Main Components
                  </h4>
                  <ul className="space-y-5">
                    {[
                      { c: 'ChecklistWrapper', d: 'Manages overall layout and progress persistence.' },
                      { c: 'StepItem', d: 'Renders individual steps with 6 distinct state styles.' },
                      { c: 'ProgressBar', d: 'Dynamic indicator for completion percentage.' },
                      { c: 'GuideDrawer', d: 'Interactive side-panel for training and sub-tasks.' },
                    ].map((item) => (
                      <li key={item.c} className="flex items-start gap-4">
                        <code className={cn(
                          'flex-shrink-0 rounded px-2 py-1 text-[12px] font-black transition-colors',
                          theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                        )}>
                          {item.c}
                        </code>
                        <span className={cn(
                          'text-sm font-medium transition-colors',
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        )}>
                          {item.d}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={cn(
                  'flex justify-center border-t pt-8 transition-colors',
                  theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                )}>
                  <button
                    onClick={() => setShowDocs(false)}
                    className={cn(
                      'rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95',
                      theme === 'dark' ? 'bg-white text-slate-950 shadow-white/5' : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'
                    )}
                  >
                    Back to Demo Interface
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
