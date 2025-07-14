import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Bot, Shield, Settings, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import './App.css'

function App() {
  const [botToken, setBotToken] = useState('')
  const [botStatus, setBotStatus] = useState('disconnected')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [botStats, setBotStats] = useState({
    servers: 0,
    users: 0,
    uptime: '0m',
    scriptsProtected: 0
  })

  // محاكاة حالة البوت
  useEffect(() => {
    const interval = setInterval(() => {
      if (botStatus === 'connected') {
        setBotStats(prev => ({
          ...prev,
          uptime: `${Math.floor(Math.random() * 60) + 1}m`
        }))
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [botStatus])

  const handleTokenSubmit = async (e) => {
    e.preventDefault()
    if (!botToken.trim()) {
      setMessage('يرجى إدخال توكن البوت')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      // إرسال التوكن إلى الخادم الخلفي
      const response = await fetch('http://localhost:5000/api/bot/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: botToken }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setBotStatus('connected')
        setMessage('تم تحديث توكن البوت بنجاح!')
        setBotStats({
          servers: 1,
          users: 150,
          uptime: '1m',
          scriptsProtected: 25
        })
        setBotToken('') // مسح التوكن من الحقل لأسباب أمنية
      } else {
        setBotStatus('error')
        setMessage(result.error || 'فشل في تحديث توكن البوت. تحقق من صحة التوكن.')
      }
    } catch (error) {
      setBotStatus('error')
      setMessage('خطأ في الاتصال بالخادم')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (botStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = () => {
    switch (botStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">متصل</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">خطأ</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">غير متصل</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">KULTHX Bot Control Panel</h1>
          </div>
          <p className="text-lg text-gray-600">لوحة تحكم بوت حماية نصوص Roblox</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">حالة البوت</CardTitle>
              {getStatusIcon()}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{getStatusBadge()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">السيرفرات</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{botStats.servers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{botStats.users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">النصوص المحمية</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{botStats.scriptsProtected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Token Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              إعدادات توكن البوت
            </CardTitle>
            <CardDescription>
              قم بإدخال توكن بوت الديسكورد الخاص بك لتحديث إعدادات البوت
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  توكن البوت
                </label>
                <Input
                  id="token"
                  type="password"
                  placeholder="أدخل توكن بوت الديسكورد..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? 'جاري التحديث...' : 'تحديث التوكن'}
              </Button>
            </form>

            {message && (
              <Alert className={`mt-4 ${botStatus === 'connected' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <AlertDescription className={botStatus === 'connected' ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Bot Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              معلومات البوت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">الأوامر المتاحة</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <code>!protect</code> أو <code>!حماية</code> - حماية نص جديد</li>
                  <li>• <code>!myscripts</code> أو <code>!نصوصي</code> - عرض النصوص المحمية</li>
                  <li>• <code>!stats</code> أو <code>!إحصائيات</code> - عرض إحصائيات البوت</li>
                  <li>• <code>!help</code> أو <code>!مساعدة</code> - عرض المساعدة</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">المميزات</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• حماية متقدمة للنصوص</li>
                  <li>• دعم الرسائل المباشرة</li>
                  <li>• واجهة تفاعلية بالأزرار</li>
                  <li>• إحصائيات مفصلة</li>
                  <li>• دعم اللغة العربية</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App

