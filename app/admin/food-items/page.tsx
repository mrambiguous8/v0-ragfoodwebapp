"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Database,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  ChevronRight,
  UtensilsCrossed,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

interface FoodItem {
  id: string
  metadata?: {
    name?: string
    category?: string
    origin?: string
    text?: string
  }
}

interface FoodFormData {
  name: string
  category: string
  origin: string
  description: string
  ingredients: string
}

const EMPTY_FORM: FoodFormData = {
  name: "",
  category: "",
  origin: "",
  description: "",
  ingredients: "",
}

export default function FoodItemsPage() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState<FoodFormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const fetchItems = useCallback(async (cursor?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (cursor) params.set("cursor", cursor)
      params.set("limit", "50")

      const response = await fetch(`/api/food-items?${params}`)
      const json = await response.json()

      if (json.success) {
        setItems(json.data.items)
        setNextCursor(json.data.nextCursor)
      } else {
        setError(json.error || "Failed to fetch items")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }, [])

  const searchItems = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setIsSearching(false)
        fetchItems()
        return
      }

      setLoading(true)
      setError(null)
      setIsSearching(true)
      try {
        const params = new URLSearchParams()
        params.set("search", query)
        params.set("limit", "100")

        const response = await fetch(`/api/food-items?${params}`)
        const json = await response.json()

        if (json.success) {
          setItems(json.data.items)
          setNextCursor(null)
        } else {
          setError(json.error || "Failed to search items")
        }
      } catch (err) {
        setError("Failed to search")
      } finally {
        setLoading(false)
      }
    },
    [fetchItems],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      searchItems(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, searchItems])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)))
    }
  }

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleDelete = async () => {
    if (selectedItems.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) {
      return
    }

    try {
      const response = await fetch("/api/food-items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedItems) }),
      })

      const json = await response.json()
      if (json.success) {
        setNotification({ type: "success", message: `Deleted ${selectedItems.size} item(s)` })
        setSelectedItems(new Set())
        if (isSearching && searchTerm) {
          searchItems(searchTerm)
        } else {
          fetchItems()
        }
      } else {
        setNotification({ type: "error", message: json.error || "Failed to delete" })
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to delete items" })
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/food-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const json = await response.json()
      if (json.success) {
        setNotification({ type: "success", message: `Added "${formData.name}"` })
        setShowAddModal(false)
        setFormData(EMPTY_FORM)
        setSearchTerm("")
        setIsSearching(false)
        fetchItems()
      } else {
        setNotification({ type: "error", message: json.error || "Failed to add item" })
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to add item" })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredItems = items

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
              : "bg-destructive/10 border border-destructive/20 text-destructive"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Add Food Item</CardTitle>
                <CardDescription>Add a new item to the knowledge base</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., Spaghetti Carbonara"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g., Pasta"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Origin</label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g., Italian"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                    placeholder="Describe the dish, its taste, texture, and how it's typically prepared..."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ingredients</label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                    placeholder="List the main ingredients..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Analytics
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Database className="w-6 h-6 text-primary" />
                Food Items Database
              </h1>
              <p className="text-sm text-muted-foreground">Manage your RAG knowledge base</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setIsSearching(false)
                fetchItems()
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search across all items in database..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {loading && searchTerm && (
                  <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={filteredItems.length === 0}>
                  {selectedItems.size === filteredItems.length && filteredItems.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                {selectedItems.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedItems.size})
                  </Button>
                )}
              </div>
            </div>
            {isSearching && searchTerm && (
              <p className="text-xs text-muted-foreground mt-2">
                Searching across entire database for "{searchTerm}"...
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold">{items.length}</p>
              <p className="text-sm text-muted-foreground">{isSearching ? "Search Results" : "Total Items"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold">{filteredItems.length}</p>
              <p className="text-sm text-muted-foreground">Displayed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold">{selectedItems.size}</p>
              <p className="text-sm text-muted-foreground">Selected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold">
                {new Set(items.map((i) => i.metadata?.category).filter(Boolean)).size}
              </p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Knowledge Base Items</CardTitle>
            <CardDescription>
              {isSearching
                ? `Showing results from semantic search across all items`
                : "Click to select items for bulk actions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive">{error}</p>
                <Button onClick={() => fetchItems()} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No items match your search" : "No food items in database"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowAddModal(true)} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Item
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item.id)}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedItems.has(item.id)
                        ? "bg-primary/5 border-primary/30"
                        : "bg-secondary/30 border-transparent hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedItems.has(item.id) ? "bg-primary border-primary" : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedItems.has(item.id) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.metadata?.name || item.id}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.metadata?.text?.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {item.metadata?.category && <Badge variant="secondary">{item.metadata.category}</Badge>}
                      {item.metadata?.origin && <Badge variant="outline">{item.metadata.origin}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isSearching && nextCursor && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={() => fetchItems(nextCursor)} className="gap-2">
                  Load More
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Data stored in Upstash Vector Database</p>
        </div>
      </div>
    </div>
  )
}
