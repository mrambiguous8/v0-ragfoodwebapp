import { NextResponse } from "next/server"

const upstashUrl = process.env.UPSTASH_VECTOR_REST_URL
const upstashToken = process.env.UPSTASH_VECTOR_REST_TOKEN

/**
 * GET /api/food-items - List all food items from vector database
 */
export async function GET(request: Request) {
  try {
    if (!upstashUrl || !upstashToken) {
      return NextResponse.json({ success: false, error: "Vector database not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor") || "0"
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)
    const searchQuery = searchParams.get("search") || ""

    if (searchQuery) {
      const searchResponse = await fetch(`${upstashUrl}/query-data`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: searchQuery,
          topK: limit,
          includeMetadata: true,
          includeVectors: false,
        }),
      })

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text()
        return NextResponse.json({ success: false, error: "Failed to search food items" }, { status: 500 })
      }

      const searchData = await searchResponse.json()
      const searchResult = searchData.result || searchData

      return NextResponse.json({
        success: true,
        data: {
          items: searchResult || [],
          nextCursor: null, // No pagination for search results
          isSearch: true,
        },
      })
    }

    const response = await fetch(`${upstashUrl}/range`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cursor,
        limit,
        includeMetadata: true,
        includeVectors: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Vector fetch error:", errorText)
      return NextResponse.json({ success: false, error: "Failed to fetch food items" }, { status: 500 })
    }

    const data = await response.json()
    const result = data.result || data

    return NextResponse.json({
      success: true,
      data: {
        items: result.vectors || [],
        nextCursor: result.nextCursor || null,
        isSearch: false,
      },
    })
  } catch (error) {
    console.error("Food items API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

/**
 * POST /api/food-items - Add a new food item
 */
export async function POST(request: Request) {
  try {
    if (!upstashUrl || !upstashToken) {
      return NextResponse.json({ success: false, error: "Vector database not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { name, category, origin, description, ingredients } = body

    if (!name || !description) {
      return NextResponse.json({ success: false, error: "Name and description are required" }, { status: 400 })
    }

    const text = [
      `Name: ${name}`,
      category && `Category: ${category}`,
      origin && `Origin: ${origin}`,
      `Description: ${description}`,
      ingredients && `Ingredients: ${ingredients}`,
    ]
      .filter(Boolean)
      .join("\n")

    const id = `food_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const response = await fetch(`${upstashUrl}/upsert-data`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          id,
          data: text,
          metadata: {
            name,
            category: category || "",
            origin: origin || "",
            text,
          },
        },
      ]),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Vector upsert error:", errorText)
      return NextResponse.json({ success: false, error: "Failed to add food item" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { id, name },
    })
  } catch (error) {
    console.error("Food items POST error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/food-items - Delete food item(s)
 */
export async function DELETE(request: Request) {
  try {
    if (!upstashUrl || !upstashToken) {
      return NextResponse.json({ success: false, error: "Vector database not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "IDs array is required" }, { status: 400 })
    }

    const response = await fetch(`${upstashUrl}/delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ids),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Vector delete error:", errorText)
      return NextResponse.json({ success: false, error: "Failed to delete food items" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { deleted: ids.length },
    })
  } catch (error) {
    console.error("Food items DELETE error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
