
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Zap, ArrowRight } from 'lucide-react'

const AppSelector = () => {
  const navigate = useNavigate()

  const handleCerebroClick = () => {
    console.log('🔄 Navigating to Cerebro...')
    navigate('/cerebro')
  }

  const handleNucleoClick = () => {
    console.log('🔄 Navigating to Núcleo...')
    navigate('/nucleo')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Platform Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the platform that fits your needs - internal knowledge management or commercial AI solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Cerebro - Internal */}
          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-purple-200 hover:border-purple-400">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-purple-900 mb-2">CEREBRO</h2>
                  <p className="text-purple-600 font-medium mb-4">Internal Knowledge Platform</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Advanced internal AI assistant for your team. Access company knowledge, 
                    get intelligent insights, and streamline internal processes.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <span>Memory & Knowledge Base</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <span>Advanced Insights & Analytics</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <span>Team Collaboration Tools</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCerebroClick}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white group"
                >
                  Access Cerebro
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Núcleo - Commercial */}
          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-blue-200 hover:border-blue-400">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">NÚCLEO</h2>
                  <p className="text-blue-600 font-medium mb-4">Commercial AI Platform</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Complete AI business suite for commercial operations. From voice strategy 
                    to automated campaigns and development workflows.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span>Launch - Voice to Strategy</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <span>AutoDev - Code Generation</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span>Automation - n8n Workflows</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <span>Commercial Analytics</span>
                  </div>
                </div>

                <Button 
                  onClick={handleNucleoClick}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white group"
                >
                  Launch Núcleo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            Need help choosing? Both platforms offer powerful AI capabilities tailored for different use cases.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AppSelector
