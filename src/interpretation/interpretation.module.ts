import { Module } from '@nestjs/common';
import { InterpretationController } from './interpretation.controller';
import { InterpreterPort } from './interpreter.port';
import { StubInterpreter } from './stub-interpreter';

@Module({
  controllers: [InterpretationController],
  // TODO(ai): the Anthropic adapter replaces this provider and nothing else.
  providers: [{ provide: InterpreterPort, useClass: StubInterpreter }],
  exports: [InterpreterPort],
})
export class InterpretationModule {}
