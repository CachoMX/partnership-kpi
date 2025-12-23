"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"

interface DateRangeFilterProps {
  dateFrom: string
  dateTo: string
  onDateChange: (from: string, to: string) => void
  onApply: (from: string, to: string) => void
}

export function DateRangeFilter({ dateFrom, dateTo, onDateChange, onApply }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    dateFrom ? new Date(dateFrom) : undefined
  )
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    dateTo ? new Date(dateTo) : undefined
  )

  const formatDateForApi = (date: Date): string => {
    return format(date, "yyyy-MM-dd")
  }

  const formatDateDisplay = (date: Date | undefined): string => {
    return date ? format(date, "MM/dd/yyyy") : ""
  }

  const handleApply = () => {
    if (startDate && endDate) {
      const from = formatDateForApi(startDate)
      const to = formatDateForApi(endDate)
      onDateChange(from, to)
      setIsOpen(false)
      onApply(from, to)
    }
  }

  const handleClear = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onDateChange("", "")
    setIsOpen(false)
    onApply("", "")
  }

  // Sync state when props change
  React.useEffect(() => {
    if (dateFrom) {
      setStartDate(new Date(dateFrom))
    }
    if (dateTo) {
      setEndDate(new Date(dateTo))
    }
  }, [dateFrom, dateTo])

  const hasDateRange = dateFrom && dateTo

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'center',
      backgroundColor: 'var(--color-bg-card)',
      padding: 'var(--space-3)',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
    }}>
      {/* Display current range if set */}
      {hasDateRange && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}>
            <span style={{
              color: 'var(--color-text-muted)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              From
            </span>
            <span style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
            }}>
              {formatDateDisplay(startDate)}
            </span>
          </div>
          <div style={{
            width: '1px',
            height: '24px',
            backgroundColor: 'var(--color-border)',
          }} />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}>
            <span style={{
              color: 'var(--color-text-muted)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              To
            </span>
            <span style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
            }}>
              {formatDateDisplay(endDate)}
            </span>
          </div>
        </div>
      )}

      {/* Calendar button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <CalendarIcon className="w-4 h-4" />
        {!hasDateRange && <span style={{ marginLeft: '6px' }}>Select Dates</span>}
      </Button>

      {/* Clear button */}
      {hasDateRange && (
        <Button
          onClick={handleClear}
          size="sm"
          variant="ghost"
          style={{
            color: 'var(--color-text-muted)',
          }}
        >
          Clear
        </Button>
      )}

      {/* Calendar Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-[700px]"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--color-text-primary)' }}>
              Select Date Range
            </DialogTitle>
          </DialogHeader>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            padding: '16px 0',
          }}>
            {/* Start Date */}
            <div>
              <label style={{
                color: 'var(--color-text-muted)',
                fontSize: '14px',
                display: 'block',
                marginBottom: '8px',
                fontWeight: 500,
              }}>
                Start Date
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '12px',
              }}>
                <CalendarIcon style={{
                  color: 'var(--color-text-muted)',
                  width: '16px',
                  height: '16px'
                }} />
                <input
                  type="text"
                  value={formatDateDisplay(startDate)}
                  readOnly
                  placeholder="mm/dd/yyyy"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    flex: 1,
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: '8px',
                padding: '8px',
                border: '1px solid var(--color-border)',
              }}>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  className="!bg-transparent"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label style={{
                color: 'var(--color-text-muted)',
                fontSize: '14px',
                display: 'block',
                marginBottom: '8px',
                fontWeight: 500,
              }}>
                End Date
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '12px',
              }}>
                <CalendarIcon style={{
                  color: 'var(--color-text-muted)',
                  width: '16px',
                  height: '16px'
                }} />
                <input
                  type="text"
                  value={formatDateDisplay(endDate)}
                  readOnly
                  placeholder="mm/dd/yyyy"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    flex: 1,
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: '8px',
                padding: '8px',
                border: '1px solid var(--color-border)',
              }}>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => startDate ? date < startDate : false}
                  className="!bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border)',
          }}>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!startDate || !endDate}
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'white',
              }}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
