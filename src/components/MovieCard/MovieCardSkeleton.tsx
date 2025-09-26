import React from 'react'
import { Card, CardContent, Skeleton } from '@/components/ui'

export function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[2/3]">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}

interface MovieCardSkeletonGridProps {
  count?: number
}

export function MovieCardSkeletonGrid({ count = 8 }: MovieCardSkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  )
}