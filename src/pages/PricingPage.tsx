import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Check, Crown } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl bg-[#1F2937] border border-[#374151] rounded-xl p-10">
        <h1 className="text-2xl font-bold text-foreground mb-1 text-center">Choose your plan</h1>
        <p className="text-muted-foreground text-center mb-8">Free users get Idea of the Day. Premium unlocks the full archive and all reports.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#374151] rounded-xl p-6 bg-[#111827]">
            <h2 className="text-lg font-semibold text-foreground mb-2">Free</h2>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>Idea of the Day</li>
              <li>Full report for today’s idea</li>
            </ul>
            <Button asChild className="w-full h-10 bg-muted hover:bg-muted/80 text-foreground">
              <Link to="/signup">Create free account</Link>
            </Button>
          </div>
          <div className="border border-[#374151] rounded-xl p-6 bg-[#111827]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-foreground">Premium</h2>
              <span className="text-sm text-emerald-400">₹499 / year</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>Everything in Free</li>
              <li>Full archive access</li>
              <li>All reports unlocked</li>
            </ul>
            <Button asChild className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/signup?intent=premium">Go Premium</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


