/**
 * Type declarations for snarkjs
 * Since @types/snarkjs doesn't exist, we provide minimal types
 */

declare module 'snarkjs' {
  export namespace groth16 {
    export function fullProve(
      input: Record<string, unknown>,
      wasmFile: string,
      zkeyFile: string
    ): Promise<{
      proof: unknown;
      publicSignals: string[];
    }>;

    export function verify(
      vkey: unknown,
      publicSignals: string[],
      proof: unknown
    ): Promise<boolean>;

    export function exportSolidityCallData(
      proof: unknown,
      publicSignals: string[]
    ): Promise<string>;
  }

  export namespace plonk {
    export function fullProve(
      input: Record<string, unknown>,
      wasmFile: string,
      zkeyFile: string
    ): Promise<{
      proof: unknown;
      publicSignals: string[];
    }>;

    export function verify(
      vkey: unknown,
      publicSignals: string[],
      proof: unknown
    ): Promise<boolean>;
  }

  export namespace powersoftau {
    export function newAccumulator(
      curve: string,
      power: number,
      outputFile: string
    ): Promise<void>;

    export function contribute(
      inputFile: string,
      outputFile: string,
      name: string,
      entropy: string
    ): Promise<void>;

    export function preparePhase2(
      inputFile: string,
      outputFile: string
    ): Promise<void>;
  }

  export namespace zKey {
    export function newZKey(
      r1csFile: string,
      ptauFile: string,
      zkeyFile: string
    ): Promise<void>;

    export function contribute(
      zkeyInputFile: string,
      zkeyOutputFile: string,
      name: string,
      entropy: string
    ): Promise<void>;

    export function exportVerificationKey(
      zkeyFile: string
    ): Promise<unknown>;
  }

  export namespace r1cs {
    export function info(
      r1csFile: string
    ): Promise<{
      nVars: number;
      nPublic: number;
      nOutputs: number;
      nConstraints: number;
    }>;

    export function exportJson(
      r1csFile: string,
      outputFile: string
    ): Promise<void>;
  }
}
