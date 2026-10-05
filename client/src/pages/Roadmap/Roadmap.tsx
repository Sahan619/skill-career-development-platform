import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface CareerPath {
  title: string;
  skills: string[];
}

const Roadmap = () => {
  const location = useLocation();

  const careerPath = location.state as CareerPath | null;

  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
  if (!careerPath) {
    return [];
  }

  const savedSteps = localStorage.getItem(
    `roadmap-${careerPath.title}`
  );

  return savedSteps ? JSON.parse(savedSteps) : [];
});

  useEffect(() => {
  if (!careerPath) return;

  localStorage.setItem(
    `roadmap-${careerPath.title}`,
    JSON.stringify(completedSteps)
  );
}, [completedSteps, careerPath]);



  if (!careerPath) {
    return <p>No career path selected.</p>;
  }

  const completionPercentage =
    careerPath.skills.length > 0
      ? Math.round(
          (completedSteps.length / careerPath.skills.length) * 100
        )
      : 0;

  return (
    <div>
      <h1>{careerPath.title} Roadmap</h1>

      <h2>Learning Path</h2>

      <p>
        Roadmap Progress: {completedSteps.length} / {careerPath.skills.length}
      </p>

      <p>
        Completion: {completionPercentage}%
      </p>

      <div
  style={{
    width: '300px',
    height: '20px',
    border: '1px solid #ccc',
  }}
>
  <div
    style={{
      width: `${completionPercentage}%`,
      height: '100%',
      backgroundColor: 'green',
    }}
  />
</div>

      <div>
        {careerPath.skills.map((skill, index) => {
          const isCompleted = completedSteps.includes(skill);

          return (
            <div key={skill}>
              <h3>Step {index + 1}</h3>

              <p>
                {skill} {isCompleted ? '✅' : '⬜'}
              </p>

              <button
                onClick={() => {
                  if (isCompleted) {
                    setCompletedSteps(
                      completedSteps.filter((item) => item !== skill)
                    );
                  } else {
                    setCompletedSteps([...completedSteps, skill]);
                  }
                }}
              >
                {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmap;