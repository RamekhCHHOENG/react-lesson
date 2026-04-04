from pydantic import BaseModel


class BurndownDataPoint(BaseModel):
    date: str
    ideal: float
    actual: float


class VelocityDataPoint(BaseModel):
    sprint_name: str
    completed_points: float
    committed_points: float


class CumulativeFlowDataPoint(BaseModel):
    date: str
    todo: int
    in_progress: int
    review: int
    done: int
