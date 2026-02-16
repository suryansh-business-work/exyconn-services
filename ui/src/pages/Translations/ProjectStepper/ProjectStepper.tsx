import { useState, useCallback } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import {
  Language,
  FolderOpen,
  DataObject,
  Translate,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import StepLocaleSelection from "./StepLocaleSelection";
import StepSectionCreation from "./StepSectionCreation";
import StepVariableDefinition from "./StepVariableDefinition";
import StepTranslationInput from "./StepTranslationInput";

interface ProjectStepperProps {
  projectId: string;
}

const STEPS = [
  { label: "Locale Selection", icon: <Language fontSize="small" /> },
  { label: "Create Sections", icon: <FolderOpen fontSize="small" /> },
  { label: "Section Variables", icon: <DataObject fontSize="small" /> },
  { label: "Translation Input", icon: <Translate fontSize="small" /> },
];

const ProjectStepper = ({ projectId }: ProjectStepperProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [localeCount, setLocaleCount] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);
  const [variableCount, setVariableCount] = useState(0);
  const [warning, setWarning] = useState("");

  const handleLocalesChange = useCallback((count: number) => {
    setLocaleCount(count);
  }, []);

  const handleSectionsChange = useCallback((count: number) => {
    setSectionCount(count);
  }, []);

  const handleVariablesChange = useCallback((count: number) => {
    setVariableCount(count);
  }, []);

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 0: return localeCount > 0;
      case 1: return sectionCount > 0;
      case 2: return variableCount > 0;
      default: return true;
    }
  };

  const getStepWarning = (step: number): string => {
    switch (step) {
      case 0: return "Please activate at least one locale before proceeding.";
      case 1: return "Please create at least one section before proceeding.";
      case 2: return "Please add at least one variable/key before proceeding.";
      default: return "";
    }
  };

  const handleNext = () => {
    if (!canProceed(activeStep)) {
      setWarning(getStepWarning(activeStep));
      return;
    }
    setWarning("");
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setWarning("");
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (step: number) => {
    if (step < activeStep || canProceed(activeStep)) {
      setWarning("");
      setActiveStep(step);
    } else {
      setWarning(getStepWarning(activeStep));
    }
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stepper nonLinear activeStep={activeStep} alternativeLabel>
          {STEPS.map((step, index) => (
            <Step key={step.label} completed={canProceed(index) && index < activeStep}>
              <StepButton onClick={() => handleStepClick(index)} icon={step.icon}>
                <StepLabel>{step.label}</StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Paper>
      {warning && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setWarning("")}>
          {warning}
        </Alert>
      )}
      <Box sx={{ minHeight: 300 }}>
        {activeStep === 0 && (
          <StepLocaleSelection projectId={projectId} onLocalesChange={handleLocalesChange} />
        )}
        {activeStep === 1 && (
          <StepSectionCreation projectId={projectId} onSectionsChange={handleSectionsChange} />
        )}
        {activeStep === 2 && (
          <StepVariableDefinition projectId={projectId} onVariablesChange={handleVariablesChange} />
        )}
        {activeStep === 3 && (
          <StepTranslationInput projectId={projectId} />
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outlined"
        >
          Back
        </Button>
        {activeStep < STEPS.length - 1 && (
          <Button
            endIcon={<ArrowForward />}
            onClick={handleNext}
            variant="contained"
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ProjectStepper;
