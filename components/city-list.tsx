"use client"

import { useTime } from "@/components/time-provider"
import { CityCard } from "./city-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { AddCityModal } from "./add-city-modal"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCityCard({ city, onEdit }: { city: any, onEdit: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: city.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <CityCard city={city} onEdit={onEdit} />
        </div>
    );
}

export function CityList() {
    const { cities, reorderCities } = useTime()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCityId, setEditingCityId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = cities.findIndex((c) => c.id === active.id);
            const newIndex = cities.findIndex((c) => c.id === over.id);
            reorderCities(oldIndex, newIndex);
        }
    };

    const handleEdit = (id: string) => {
        setEditingCityId(id)
        setIsModalOpen(true)
    }

    const handleAdd = () => {
        setEditingCityId(null)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={cities.map(c => c.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cities.map(city => (
                            <SortableCityCard
                                key={city.id}
                                city={city}
                                onEdit={() => handleEdit(city.id)}
                            />
                        ))}

                        {/* Add Button Card - Not sortable, always at end */}
                        <Button
                            variant="outline"
                            className="h-full min-h-[180px] border-dashed border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-700 flex flex-col gap-2"
                            onClick={handleAdd}
                        >
                            <Plus className="h-8 w-8 opacity-50" />
                            <span>Add City</span>
                        </Button>
                    </div>
                </SortableContext>
            </DndContext>

            <AddCityModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingId={editingCityId}
            />
        </div>
    )
}
