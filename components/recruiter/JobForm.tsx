'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobSchema } from '@/lib/utils/validators';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Plus, Trash2, X } from 'lucide-react';
import { JOB_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES } from '@/lib/utils/constants';
import toast from 'react-hot-toast';

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function JobForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: JobFormProps) {
  const [skillInput, setSkillInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [responsibilityInput, setResponsibilityInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      requirements: initialData?.requirements || [],
      responsibilities: initialData?.responsibilities || [],
      location: initialData?.location || '',
      type: initialData?.type || 'full-time',
      experienceLevel: initialData?.experienceLevel || 'mid',
      salaryMin: initialData?.salaryMin || 0,
      salaryMax: initialData?.salaryMax || 0,
      currency: initialData?.currency || 'USD',
      salaryPeriod: initialData?.salaryPeriod || 'yearly',
      companyName: initialData?.companyName || '',
      companyLogo: initialData?.companyLogo || '',
      companyDescription: initialData?.companyDescription || '',
      category: initialData?.category || '',
      skills: initialData?.skills || [],
      applicationDeadline: initialData?.applicationDeadline || '',
    },
  });

  const skills = watch('skills') || [];
  const requirements = watch('requirements') || [];
  const responsibilities = watch('responsibilities') || [];

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setValue('skills', [...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setValue('skills', newSkills);
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setValue('requirements', [...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    const newRequirements = [...requirements];
    newRequirements.splice(index, 1);
    setValue('requirements', newRequirements);
  };

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      setValue('responsibilities', [...responsibilities, responsibilityInput.trim()]);
      setResponsibilityInput('');
    }
  };

  const removeResponsibility = (index: number) => {
    const newResponsibilities = [...responsibilities];
    newResponsibilities.splice(index, 1);
    setValue('responsibilities', newResponsibilities);
  };

  const handleFormSubmit = async (data: JobFormData) => {
    try {
      await onSubmit(data);
      toast.success('Job posted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post job');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title *</label>
            <Input
              {...register('title')}
              placeholder="e.g., Senior Frontend Developer"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Job Type *</label>
              <Select
                onValueChange={(value) => setValue('type', value as any)}
                defaultValue={watch('type')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Experience Level *</label>
              <Select
                onValueChange={(value) => setValue('experienceLevel', value as any)}
                defaultValue={watch('experienceLevel')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <Input
                {...register('location')}
                placeholder="e.g., Remote, New York, NY"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && (
                <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select
                onValueChange={(value) => setValue('category', value)}
                defaultValue={watch('category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Job Description *</label>
            <Textarea
              {...register('description')}
              placeholder="Describe the job responsibilities, team, culture, etc."
              rows={6}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements & Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Requirements *</label>
            <div className="flex gap-2 mb-3">
              <Input
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                placeholder="Add a requirement"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
              />
              <Button type="button" onClick={addRequirement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-secondary rounded"
                >
                  <span>{req}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.requirements && (
              <p className="text-sm text-red-500 mt-1">{errors.requirements.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Responsibilities *</label>
            <div className="flex gap-2 mb-3">
              <Input
                value={responsibilityInput}
                onChange={(e) => setResponsibilityInput(e.target.value)}
                placeholder="Add a responsibility"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addResponsibility();
                  }
                }}
              />
              <Button type="button" onClick={addResponsibility}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {responsibilities.map((resp, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-secondary rounded"
                >
                  <span>{resp}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResponsibility(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.responsibilities && (
              <p className="text-sm text-red-500 mt-1">{errors.responsibilities.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills & Salary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Required Skills</label>
            <div className="flex gap-2 mb-3">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill (e.g., React, Python, AWS)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full"
                >
                  <span className="text-sm">{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Salary *</label>
              <Input
                type="number"
                {...register('salaryMin', { valueAsNumber: true })}
                className={errors.salaryMin ? 'border-red-500' : ''}
              />
              {errors.salaryMin && (
                <p className="text-sm text-red-500 mt-1">{errors.salaryMin.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Salary *</label>
              <Input
                type="number"
                {...register('salaryMax', { valueAsNumber: true })}
                className={errors.salaryMax ? 'border-red-500' : ''}
              />
              {errors.salaryMax && (
                <p className="text-sm text-red-500 mt-1">{errors.salaryMax.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <Input
                {...register('currency')}
                placeholder="USD"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Salary Period</label>
            <Select
              onValueChange={(value) => setValue('salaryPeriod', value as any)}
              defaultValue={watch('salaryPeriod')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name *</label>
            <Input
              {...register('companyName')}
              placeholder="Your company name"
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500 mt-1">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company Logo URL</label>
            <Input
              {...register('companyLogo')}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company Description</label>
            <Textarea
              {...register('companyDescription')}
              placeholder="Brief description about your company"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Save as Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Job'}
        </Button>
      </div>
    </form>
  );
}