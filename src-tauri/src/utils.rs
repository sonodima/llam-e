/// Constructs an instruction prompt from the given instruction.
pub fn build_prompt_from_instruction(instruction: &str) -> String {
    let prefix = "Below is the instruction that describes a task. Write a response that appropriately completes the request.";
    format!(
        " {}\n\n### Instruction:\n\n{}\n\n### Response:\n\n",
        prefix, instruction
    )
}
