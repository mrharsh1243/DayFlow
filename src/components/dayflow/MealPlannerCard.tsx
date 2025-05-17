
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Utensils, GlassWater, Apple, Edit2, Check } from "lucide-react";
import type { Meal } from '@/types/dayflow';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const MEAL_TIMES: { name: Meal['name'], icon: React.ElementType }[] = [
  { name: 'Breakfast', icon: Utensils },
  { name: 'Lunch', icon: Utensils },
  { name: 'Dinner', icon: Utensils },
  { name: 'Snacks', icon: Apple },
];

export function MealPlannerCard() {
  const [meals, setMeals] = useState<Record<Meal['name'], string>>({
    Breakfast: '', Lunch: '', Dinner: '', Snacks: ''
  });
  const [waterIntake, setWaterIntake] = useState('');
  const [supplements, setSupplements] = useState('');
  const [editingMeal, setEditingMeal] = useState<Meal['name'] | null>(null);


  useEffect(() => {
    const storedMeals = localStorage.getItem('dayflow-meals');
    if (storedMeals) setMeals(JSON.parse(storedMeals));
    const storedWater = localStorage.getItem('dayflow-water');
    if (storedWater) setWaterIntake(storedWater);
    const storedSupps = localStorage.getItem('dayflow-supplements');
    if (storedSupps) setSupplements(storedSupps);
  }, []);

  useEffect(() => {
    localStorage.setItem('dayflow-meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('dayflow-water', waterIntake);
  }, [waterIntake]);
  
  useEffect(() => {
    localStorage.setItem('dayflow-supplements', supplements);
  }, [supplements]);

  const handleMealChange = (mealName: Meal['name'], value: string) => {
    setMeals(prevMeals => ({ ...prevMeals, [mealName]: value }));
  };

  const toggleEditMeal = (mealName: Meal['name']) => {
    setEditingMeal(editingMeal === mealName ? null : mealName);
  };

  return (
    <Card className="shadow-lg">
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="w-full text-left hover:no-underline p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Utensils className="text-primary" />
                Meal Planner
              </CardTitle>
              <CardDescription>Plan your meals and track hydration.</CardDescription>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-4 p-6 pt-2">
              {MEAL_TIMES.map(mealTime => {
                const Icon = mealTime.icon;
                return (
                  <div key={mealTime.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Icon className="h-5 w-5 text-accent" /> {mealTime.name}
                      </h4>
                      <Button variant="ghost" size="icon" onClick={() => toggleEditMeal(mealTime.name)} className="h-7 w-7">
                        {editingMeal === mealTime.name ? <Check className="h-4 w-4 text-green-500" /> : <Edit2 className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    {editingMeal === mealTime.name ? (
                      <Textarea
                        value={meals[mealTime.name]}
                        onChange={(e) => handleMealChange(mealTime.name, e.target.value)}
                        placeholder={`What's for ${mealTime.name.toLowerCase()}?`}
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground pl-7 min-h-[2rem] pt-1 pb-1">
                        {meals[mealTime.name] || `No ${mealTime.name.toLowerCase()} planned.`}
                      </p>
                    )}
                  </div>
                );
              })}
              <div className="space-y-1 pt-2 border-t">
                <h4 className="font-semibold flex items-center gap-2"><GlassWater className="h-5 w-5 text-accent" /> Water Intake</h4>
                <Input
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(e.target.value)}
                  placeholder="e.g., 2 liters or 8 glasses"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold">Supplements</h4>
                <Input
                  value={supplements}
                  onChange={(e) => setSupplements(e.target.value)}
                  placeholder="e.g., Vitamin D, Omega-3"
                  className="text-sm"
                />
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
