import { ChatInterface } from "@/components/chat-interface"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <ChatInterface />
      <Footer />
    </main>
  )
}
