'use client'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg flex items-center gap-2">
      🖨️ พิมพ์ / PDF
    </button>
  )
}
